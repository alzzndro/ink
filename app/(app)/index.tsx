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

interface Post {
  id: string;
  title: string;
  description: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  user_id?: string;
}

// --- NEW UI: Card Component ---
const PostCard = ({ item, user, onDelete, onEdit }: {
  item: Post,
  user: any,
  onDelete: (id: string) => void,
  onEdit: (item: Post) => void
}) => {
  const player = useVideoPlayer(item.media_url ?? "", player => {
    player.loop = true;
    player.muted = true; // Auto-play muted usually better for feeds
  });

  return (
    <View className="bg-white mb-6 mx-1 rounded-[32px] shadow-sm shadow-emerald-900/10 border border-slate-100 overflow-hidden">

      {/* 1. MEDIA SECTION (Top of Card) */}
      {item.media_url && (
        <View className="w-full h-60 bg-slate-50 relative">
          {item.media_type === 'video' ? (
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              nativeControls={false} // Clean look
            />
          ) : (
            <Image
              source={{ uri: item.media_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
          {/* Media Type Badge */}
          <View className="absolute top-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
            <Ionicons
              name={item.media_type === 'video' ? 'videocam' : 'image'}
              size={12}
              color="white"
            />
          </View>
        </View>
      )}

      {/* 2. CONTENT SECTION */}
      <View className="p-6">

        {/* Date & Meta */}
        <View className="flex-row items-center mb-3">
          <View className="h-6 w-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
            <Text className="text-[10px] font-bold text-emerald-700">
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-emerald-600/60 text-xs font-semibold uppercase tracking-wider">
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Title & Desc */}
        <Text className="text-2xl font-bold text-emerald-950 mb-2 leading-tight">
          {item.title}
        </Text>
        <Text className="text-slate-500 text-base leading-relaxed mb-6">
          {item.description}
        </Text>

        {/* 3. FOOTER ACTIONS (Divider & Buttons) */}
        <View className="border-t border-slate-100 pt-4 flex-row justify-end space-x-2">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="flex-row items-center px-4 py-2 bg-emerald-50 rounded-full"
          >
            <Ionicons name="create-outline" size={18} color="#059669" />
            <Text className="ml-2 text-emerald-700 font-bold text-sm">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            className="flex-row items-center px-4 py-2 bg-red-50 rounded-full"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function FeedPage() {
  // --- LOGIC UNTOUCHED ---
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => { if (user) fetchPosts(); }, [user]);

  const fetchPosts = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) console.error(error); else setPosts(data || []);
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setMediaFile(result.assets[0]);
  };

  const uploadToSupabase = async (uri: string, type: "image" | "video") => {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    const fileData = decode(base64);
    const ext = uri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
    const fileName = `${Date.now()}.${ext}`;
    const path = `uploads/${fileName}`;
    const contentType = type === "video" ? "video/mp4" : ext === "png" ? "image/png" : "image/jpeg";
    const { error } = await supabase.storage.from("post-media").upload(path, fileData, { contentType, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("post-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title || !description) { Alert.alert('Error', 'Please fill in title and description'); return; }
    setLoading(true);
    try {
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;
      if (mediaFile) {
        mediaType = mediaFile.type === 'video' ? 'video' : 'image';
        mediaUrl = await uploadToSupabase(mediaFile.uri, mediaType);
      }
      const { data, error } = await supabase.from('posts').insert([{ title, description, media_url: mediaUrl, media_type: mediaType, user_id: user?.id, }]).select();
      if (error) throw error;
      if (data) setPosts(prev => [data[0], ...prev]);
      setTitle(''); setDescription(''); setMediaFile(null); setCreateModalVisible(false);
      Alert.alert("Success", "Post created!");
    } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) Alert.alert('Error', error.message); else setPosts(posts.filter(p => p.id !== id));
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
      const { data, error } = await supabase.from('posts').update({ title: editPost.title, description: editPost.description, media_url: mediaUrl, media_type: mediaType }).eq('id', editPost.id).select();
      if (error) throw error;
      if (data && data[0]) { setPosts(prev => prev.map(p => (p.id === editPost.id ? data[0] : p))); }
      setEditPost(null); setMediaFile(null);
      Alert.alert("Success", "Post updated");
    } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); }
  };

  // --- NEW UI: Bottom Sheet Form ---
  const renderForm = (isEdit: boolean) => {
    const currentTitle = isEdit ? editPost?.title : title;
    const currentDesc = isEdit ? editPost?.description : description;
    const setterTitle = isEdit ? (t: string) => setEditPost(prev => prev ? { ...prev, title: t } : null) : setTitle;
    const setterDesc = isEdit ? (d: string) => setEditPost(prev => prev ? { ...prev, description: d } : null) : setDescription;
    const action = isEdit ? handleUpdate : handleSubmit;
    const close = isEdit ? () => setEditPost(null) : () => setCreateModalVisible(false);

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-emerald-950/40">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="bg-white w-full rounded-t-[40px] p-8 h-[90%] shadow-2xl">

            {/* Modal Handle */}
            <View className="items-center mb-8">
              <View className="w-16 h-1.5 bg-slate-200 rounded-full" />
            </View>

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-3xl font-extrabold text-emerald-950">
                {isEdit ? "Edit Entry" : "New Entry"}
              </Text>
              <TouchableOpacity onPress={close} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-5">
              <View>
                <Text className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Title</Text>
                <TextInput
                  value={currentTitle}
                  onChangeText={setterTitle}
                  className="bg-slate-50 border border-slate-200 focus:border-emerald-500 text-emerald-900 p-5 rounded-2xl text-lg font-bold"
                  placeholder="Give it a headline..."
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View>
                <Text className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Thoughts</Text>
                <TextInput
                  value={currentDesc}
                  onChangeText={setterDesc}
                  multiline
                  className="bg-slate-50 border border-slate-200 focus:border-emerald-500 text-slate-700 p-5 rounded-2xl min-h-[120px] text-base leading-6"
                  placeholder="Write your story here..."
                  placeholderTextColor="#94a3b8"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              <View>
                <TouchableOpacity
                  onPress={pickMedia}
                  className={`border-2 border-dashed rounded-2xl h-24 items-center justify-center flex-row space-x-3 ${mediaFile ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-300'}`}
                >
                  {mediaFile ? (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color="#059669" />
                      <Text className="text-emerald-700 font-bold">Media Attached</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="images-outline" size={24} color="#64748b" />
                      <Text className="text-slate-500 font-bold">Add Photo or Video</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={action}
                disabled={loading}
                className={`w-full py-5 rounded-2xl mt-4 shadow-xl flex-row justify-center items-center ${loading ? 'bg-emerald-400' : 'bg-emerald-600 shadow-emerald-500/40'}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white text-lg font-bold mr-2">
                      {isEdit ? 'Save Updates' : 'Publish Note'}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-1 px-4">

        {/* --- NEW UI: Modern Header --- */}
        <View className="flex-row justify-between items-end pb-6 pt-2">
          <View>
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Workspace</Text>
            <Text className="text-4xl font-black text-emerald-950">My Notes</Text>
          </View>
          <TouchableOpacity onPress={() => signOut()} className="bg-white p-3 flex flex-row gap-3 rounded-2xl shadow-sm border border-slate-100">
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* --- LIST --- */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              item={item}
              user={user}
              onDelete={handleDelete}
              onEdit={(post) => { setEditPost(post); setMediaFile(null); }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-32">
              <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6 animate-pulse">
                <Ionicons name="leaf" size={40} color="#059669" />
              </View>
              <Text className="text-emerald-950 text-2xl font-bold">Fresh Canvas</Text>
              <Text className="text-slate-400 text-center mt-2 max-w-[200px]">Start your collection by adding a new note below.</Text>
            </View>
          }
        />

        {/* --- NEW UI: FAB (Floating Action Button) --- */}
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="absolute bottom-8 self-center bg-emerald-600 px-8 py-4 rounded-full shadow-2xl shadow-emerald-600/50 flex-row items-center"
        >
          <Ionicons name="add" size={28} color="white" />
          <Text className="text-white font-bold text-lg ml-2">New Note</Text>
        </TouchableOpacity>

        {/* Modals */}
        <Modal visible={createModalVisible} animationType="slide" transparent={true} onRequestClose={() => setCreateModalVisible(false)}>
          {renderForm(false)}
        </Modal>
        <Modal visible={!!editPost} animationType="slide" transparent={true} onRequestClose={() => setEditPost(null)}>
          {renderForm(true)}
        </Modal>

      </View>
    </SafeAreaView>
  );
}