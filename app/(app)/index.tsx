import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// ... [Keep your Interface and PostItem component exactly the same] ...
interface Post {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  user_id?: string;
}

const PostItem = ({ item, user, onDelete, onEdit }: {
  item: Post,
  user: any,
  onDelete: (id: string) => void,
  onEdit: (item: Post) => void
}) => {
  const player = useVideoPlayer(item.media_url ?? "", player => {
    player.loop = true;
  });

  return (
    <View className="bg-gray-800 mb-4 p-4 rounded-xl border border-gray-700">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">{item.title}</Text>
          <Text className="text-gray-300 mt-1">{item.description}</Text>
        </View>

        <View className="flex-row space-x-2 ml-2">
          <TouchableOpacity onPress={() => onEdit(item)}>
            <Ionicons name="create-outline" size={20} color="#818cf8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      {item.media_url && (
        <View className="mt-2 rounded-lg overflow-hidden h-52 w-full bg-black">
          {item.media_type === 'video' ? (
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              allowsFullscreen
              allowsPictureInPicture
            />
          ) : (
            <Image
              source={{ uri: item.media_url }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
        </View>
      )}
    </View>
  );
};

export default function FeedPage() {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setPosts(data || []);
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      // @ts-ignore: MediaType is the replacement but causes crashes in this version
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMediaFile(result.assets[0]);
    }
  };

  // ✅ FIXED UPLOAD FUNCTION
  const uploadToSupabase = async (uri: string, type: "image" | "video") => {
    // 1. Read file as Base64 string
    // ✅ FIX: Use string 'base64' directly to avoid "EncodingType not found" error
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // 2. Convert Base64 String -> ArrayBuffer (Binary)
    const fileData = decode(base64);

    const ext = uri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
    const fileName = `${Date.now()}.${ext}`;
    const path = `uploads/${fileName}`;

    const contentType =
      type === "video"
        ? "video/mp4"
        : ext === "png"
          ? "image/png"
          : "image/jpeg";

    // 3. Upload the ArrayBuffer
    const { error } = await supabase.storage
      .from("post-media")
      .upload(path, fileData, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("post-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    setLoading(true);

    try {
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;

      if (mediaFile) {
        mediaType = mediaFile.type === 'video' ? 'video' : 'image';
        mediaUrl = await uploadToSupabase(mediaFile.uri, mediaType);
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title,
          description,
          media_url: mediaUrl,
          media_type: mediaType,
          user_id: user?.id,
        }])
        .select();

      if (error) throw error;

      if (data) setPosts(prev => [data[0], ...prev]);

      setTitle('');
      setDescription('');
      setMediaFile(null);
      setCreateModalVisible(false);

      Alert.alert("Success", "Post created!");
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) Alert.alert('Error', error.message);
    else setPosts(posts.filter(p => p.id !== id));
  };

  const handleUpdate = async () => {
    if (!editPost) return;

    setLoading(true);

    try {
      let mediaUrl = editPost.media_url;
      let mediaType = editPost.media_type;

      if (mediaFile) {
        mediaType = mediaFile.type === 'video' ? 'video' : 'image';
        mediaUrl = await uploadToSupabase(mediaFile.uri, mediaType);
      }

      const { data, error } = await supabase
        .from('posts')
        .update({
          title: editPost.title,
          description: editPost.description,
          media_url: mediaUrl,
          media_type: mediaType
        })
        .eq('id', editPost.id)
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setPosts(prev => prev.map(p => (p.id === editPost.id ? data[0] : p)));
      }

      setEditPost(null);
      setMediaFile(null);

      Alert.alert("Success", "Post updated");
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900 p-4">

      {/* Top Bar */}
      <View className="flex-row justify-between items-center mb-4 mt-8">
        <Text className="text-2xl font-bold text-white">My Posts</Text>
        <TouchableOpacity
          onPress={() => signOut()}
          className="bg-red-600 px-3 py-1 rounded-md"
        >
          <Text className="text-white text-xs font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostItem
            item={item}
            user={user}
            onDelete={handleDelete}
            onEdit={(post) => {
              setEditPost(post);
              setMediaFile(null);
            }}
          />
        )}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-10">No posts yet.</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating + Button */}
      <TouchableOpacity
        onPress={() => setCreateModalVisible(true)}
        className="absolute bottom-12 right-6 bg-indigo-600 w-16 h-16 rounded-full justify-center items-center shadow-xl"
        style={{ elevation: 8 }}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80 p-4">
          <View className="bg-gray-800 w-full p-6 rounded-xl border border-gray-600">

            <Text className="text-xl font-bold text-white mb-4">Create Post</Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              className="bg-gray-900 text-white p-3 rounded-lg border border-gray-600 mb-3"
              placeholder="Title"
              placeholderTextColor="#666"
            />

            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              className="bg-gray-900 text-white p-3 rounded-lg border border-gray-600 mb-4 h-24"
              placeholder="Description"
              placeholderTextColor="#666"
              style={{ textAlignVertical: "top" }}
            />

            <TouchableOpacity
              onPress={pickMedia}
              className="bg-gray-700 p-3 rounded-lg mb-4 flex-row justify-center"
            >
              <Text className="text-white">
                {mediaFile ? "Change Media" : "Add Image/Video"}
              </Text>
            </TouchableOpacity>

            {mediaFile && (
              <View className="mb-4">
                {mediaFile.type === "video" ? (
                  <View className="bg-black h-40 rounded-lg items-center justify-center">
                    <Text className="text-white">Video Selected</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: mediaFile.uri }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="cover"
                  />
                )}
              </View>
            )}

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-bold">
                  {loading ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setCreateModalVisible(false);
                  setMediaFile(null);
                  setTitle("");
                  setDescription("");
                }}
                className="flex-1 bg-gray-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={!!editPost}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditPost(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/80 p-4">
          <View className="bg-gray-800 w-full p-6 rounded-xl border border-gray-600">
            <Text className="text-xl font-bold text-white mb-4">Edit Post</Text>

            <TextInput
              value={editPost?.title || ''}
              onChangeText={(text) => setEditPost(prev => prev ? { ...prev, title: text } : null)}
              className="bg-gray-900 text-white p-3 rounded-lg border border-gray-600 mb-3"
            />

            <TextInput
              value={editPost?.description || ''}
              onChangeText={(text) => setEditPost(prev => prev ? { ...prev, description: text } : null)}
              multiline
              className="bg-gray-900 text-white p-3 rounded-lg border border-gray-600 mb-4 h-24"
              style={{ textAlignVertical: 'top' }}
            />

            <TouchableOpacity
              onPress={pickMedia}
              className="bg-gray-700 p-3 rounded-lg mb-6 flex-row justify-center"
            >
              <Text className="text-white">
                {mediaFile ? 'New Media Selected' : 'Replace Media (Optional)'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={loading}
                className="flex-1 bg-indigo-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-bold">
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditPost(null)}
                className="flex-1 bg-gray-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}