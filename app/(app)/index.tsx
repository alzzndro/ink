import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Keep Interface intact
interface Post {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  user_id?: string;
}

// REFACTORED: Light & Amber PostItem
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
    // Changed bg to white, added light border and soft shadow
    <View className="bg-white mb-6 rounded-3xl overflow-hidden border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row justify-between items-start p-5">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-2">
            {/* Avatar changed to amber */}
            <View className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center mr-2 border border-amber-200">
              <Text className="text-amber-700 font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-gray-400 text-xs font-medium">
              {new Date().toLocaleDateString()}
            </Text>
          </View>
          {/* Text colors changed to dark gray */}
          <Text className="text-xl font-bold text-gray-900 tracking-tight mb-1">{item.title}</Text>
          <Text className="text-gray-600 leading-relaxed text-sm">{item.description}</Text>
        </View>

        {/* Action Buttons - lighter backgrounds */}
        <View className="flex-row bg-gray-50 border border-gray-100 rounded-full p-1">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="p-2 bg-white rounded-full mr-1 border border-gray-100 shadow-sm"
          >
            {/* Edit icon set to amber */}
            <Ionicons name="pencil" size={16} color="#d97706" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            className="p-2 bg-red-50 rounded-full border border-red-100"
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {item.media_url && (
        // Background for media container set to soft gray instead of harsh black
        <View className="w-full bg-gray-50 h-64 relative items-center justify-center">
          {item.media_type === 'video' ? (
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
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
  // --- All Original Logic Kept Intact ---
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
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMediaFile(result.assets[0]);
    }
  };

  const uploadToSupabase = async (uri: string, type: "image" | "video") => {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const fileData = decode(base64);
    const ext = uri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
    const fileName = `${Date.now()}.${ext}`;
    const path = `uploads/${fileName}`;
    const contentType = type === "video" ? "video/mp4" : ext === "png" ? "image/png" : "image/jpeg";

    const { error } = await supabase.storage
      .from("post-media")
      .upload(path, fileData, { contentType, upsert: false });

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
  // --- End Original Logic ---


  // REFACTORED: Shared Form Component (Clean & Amber)
  const renderForm = (isEdit: boolean) => {
    const currentTitle = isEdit ? editPost?.title : title;
    const currentDesc = isEdit ? editPost?.description : description;
    const setterTitle = isEdit ? (t: string) => setEditPost(prev => prev ? { ...prev, title: t } : null) : setTitle;
    const setterDesc = isEdit ? (d: string) => setEditPost(prev => prev ? { ...prev, description: d } : null) : setDescription;
    const action = isEdit ? handleUpdate : handleSubmit;
    const close = isEdit ? () => setEditPost(null) : () => setCreateModalVisible(false);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // Standard dim overlay
        className="flex-1 justify-end sm:justify-center bg-gray-900/50"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* Changed Modal bg to White */}
          <View className="bg-white w-full rounded-t-[32px] sm:rounded-3xl p-8 h-[85%] sm:h-auto shadow-2xl">

            <View className="flex-row justify-between items-center mb-8">
              {/* Header text dark */}
              <Text className="text-3xl font-bold text-gray-900">
                {isEdit ? "Edit Note" : "Create Note"}
              </Text>
              <TouchableOpacity onPress={close} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              <View>
                {/* Labels changed to subtle amber/brown */}
                <Text className="text-amber-800 text-xs uppercase font-bold mb-2 ml-1 tracking-wider">Title</Text>
                {/* Inputs changed to light gray bg with subtle border */}
                <TextInput
                  value={currentTitle}
                  onChangeText={setterTitle}
                  className="bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-2xl text-lg font-semibold"
                  placeholder="What's on your mind?"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-amber-800 text-xs uppercase font-bold mb-2 ml-1 tracking-wider">Description</Text>
                <TextInput
                  value={currentDesc}
                  onChangeText={setterDesc}
                  multiline
                  className="bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-2xl min-h-[120px] text-base pt-4"
                  placeholder="Add some details..."
                  placeholderTextColor="#9ca3af"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              <View>
                <Text className="text-amber-800 text-xs uppercase font-bold mb-2 ml-1 tracking-wider">Media</Text>
                <TouchableOpacity
                  onPress={pickMedia}
                  // Dashed amber border for the upload zone
                  className="bg-amber-50/50 border-2 border-dashed border-amber-300 rounded-2xl h-36 items-center justify-center overflow-hidden"
                >
                  {mediaFile ? (
                    mediaFile.type === "video" ? (
                      <View className="items-center">
                        <Ionicons name="videocam" size={32} color="#d97706" />
                        <Text className="text-amber-700 font-medium mt-2">Video Selected</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: mediaFile.uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    )
                  ) : (
                    <View className="items-center justify-center">
                      <View className="bg-amber-100 p-3 rounded-full mb-2">
                        <Ionicons name="image-outline" size={24} color="#d97706" />
                      </View>
                      <Text className="text-amber-700 font-medium">Tap to add Image or Video</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={action}
                disabled={loading}
                // Main button changed to Amber
                className={`w-full p-4 rounded-2xl mt-2 shadow-lg flex-row justify-center items-center ${loading ? 'bg-amber-400' : 'bg-amber-500 shadow-amber-500/30'
                  }`}
              >
                {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                <Text className="text-white text-center text-lg font-bold">
                  {loading ? (isEdit ? 'Saving...' : 'Posting...') : (isEdit ? 'Save Changes' : 'Create Post')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  return (
    // Main background set to white
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* StatusBar set to dark for light background */}
      <StatusBar style="dark" />
      <View className="flex-1 bg-white px-4">

        {/* Header */}
        <View className="flex-row justify-between items-center py-5 mb-2">
          <View>
            {/* Header Text Dark */}
            <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">My Notes</Text>
            {/* Subtext updated with amber tint */}
            <Text className="text-amber-700/70 font-medium text-base">Capture your thoughts</Text>
          </View>
          <TouchableOpacity
            onPress={() => signOut()}
            className="bg-white w-12 h-12 rounded-full items-center justify-center border border-gray-100 shadow-sm"
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
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
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-70">
              <View className="bg-amber-50 p-6 rounded-full mb-4">
                <Ionicons name="documents-outline" size={64} color="#d97706" />
              </View>
              <Text className="text-gray-900 text-xl font-bold mt-4">No notes yet</Text>
              <Text className="text-gray-500 text-base mt-2 text-center leading-6">Tap the amber button below{'\n'}to create your first note.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button - Changed to Amber */}
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="absolute bottom-10 right-6 bg-amber-500 w-16 h-16 rounded-full justify-center items-center shadow-lg shadow-amber-500/40"
        >
          <Ionicons name="add" size={36} color="white" />
        </TouchableOpacity>

        {/* Modals (Keep logic, just render the new form) */}
        <Modal
          visible={createModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCreateModalVisible(false)}
        >
          {renderForm(false)}
        </Modal>

        <Modal
          visible={!!editPost}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setEditPost(null)}
        >
          {renderForm(true)}
        </Modal>

      </View>
    </SafeAreaView>
  );
}