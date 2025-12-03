import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from "expo-file-system/legacy"; // Standard import
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InkInput from '../../components/InkInput'; // Reuse for consistency
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

// --- 1. COMPONENT: Minimalist Post Card ---
const PostCard = ({ item, user, onDelete, onEdit }: {
  item: Post,
  user: any,
  onDelete: (id: string) => void,
  onEdit: (item: Post) => void
}) => {
  const player = useVideoPlayer(item.media_url ?? "", player => {
    player.loop = true;
    player.muted = true;
  });

  return (
    <View className="bg-white mb-8 mx-1 rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">

      {/* Header: Date & User */}
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="h-8 w-8 bg-black rounded-full items-center justify-center mr-3">
            <Text className="text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Minimalist Options */}
        <View className="flex-row space-x-2">
          <TouchableOpacity onPress={() => onEdit(item)} className="p-2">
            <Ionicons name="create-outline" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Media: Edge-to-Edge */}
      {item.media_url && (
        <View className="w-full h-64 bg-zinc-50 relative">
          {item.media_type === 'video' ? (
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              nativeControls={false}
            />
          ) : (
            <Image
              source={{ uri: item.media_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          )}
        </View>
      )}

      {/* Content: Editorial Typography */}
      <View className="px-6 py-6">
        <Text className="text-2xl font-light text-black tracking-tight mb-2 leading-tight">
          {item.title}
        </Text>
        <Text className="text-zinc-500 text-base leading-relaxed font-normal">
          {item.description}
        </Text>
      </View>
    </View>
  );
};

// --- 2. PAGE: Main Feed ---
export default function FeedPage() {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  // Form States
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
    const path = `uploads/${Date.now()}.${ext}`;
    const contentType = type === "video" ? "video/mp4" : ext === "png" ? "image/png" : "image/jpeg";
    const { error } = await supabase.storage.from("post-media").upload(path, fileData, { contentType, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("post-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title || !description) { Alert.alert('Missing Info', 'Please add a title and description.'); return; }
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
      closeModal();
    } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); }
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
      closeModal();
    } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) Alert.alert('Error', error.message); else setPosts(posts.filter(p => p.id !== id));
  };

  const closeModal = () => {
    setCreateModalVisible(false);
    setEditPost(null);
    setTitle('');
    setDescription('');
    setMediaFile(null);
  };

  // --- 3. COMPONENT: Bottom Sheet Form ---
  const renderForm = (isEdit: boolean) => {
    const currentTitle = isEdit ? editPost?.title : title;
    const currentDesc = isEdit ? editPost?.description : description;
    const setterTitle = isEdit ? (t: string) => setEditPost(prev => prev ? { ...prev, title: t } : null) : setTitle;
    const setterDesc = isEdit ? (d: string) => setEditPost(prev => prev ? { ...prev, description: d } : null) : setDescription;
    const action = isEdit ? handleUpdate : handleSubmit;

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-black/50">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="bg-white w-full rounded-t-[40px] p-8 h-[90%] shadow-2xl">

            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-3xl font-light text-black tracking-tight">
                {isEdit ? "Refine." : "Create."}
              </Text>
              <TouchableOpacity onPress={closeModal} className="p-2 bg-zinc-100 rounded-full">
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              {/* Title */}
              <InkInput
                icon="text-outline"
                placeholder="Headline"
                value={currentTitle}
                onChangeText={setterTitle}
              />

              {/* Description (Custom Multiline Input) */}
              <View className="bg-zinc-50 border border-zinc-100 rounded-3xl p-5 min-h-[120px]">
                <TextInput
                  value={currentDesc}
                  onChangeText={setterDesc}
                  multiline
                  className="text-black text-lg font-medium leading-6"
                  placeholder="Your thoughts..."
                  placeholderTextColor="#a1a1aa"
                  cursorColor="#000"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              {/* Media Picker */}
              <TouchableOpacity
                onPress={pickMedia}
                className={`border border-dashed rounded-3xl h-24 items-center justify-center flex-row space-x-3 ${mediaFile ? 'bg-zinc-50 border-black' : 'bg-white border-zinc-300'}`}
              >
                <Ionicons
                  name={mediaFile ? "checkmark-circle" : "image-outline"}
                  size={24}
                  color={mediaFile ? "#000" : "#a1a1aa"}
                />
                <Text className={`font-medium ${mediaFile ? "text-black" : "text-zinc-400"}`}>
                  {mediaFile ? "Media Attached" : "Attach Image or Video"}
                </Text>
              </TouchableOpacity>

              {/* Action Button */}
              <TouchableOpacity
                onPress={action}
                disabled={loading}
                className={`w-full py-5 rounded-full flex-row justify-center items-center shadow-lg shadow-black/20 ${loading ? 'bg-zinc-800' : 'bg-black'}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white text-lg font-bold tracking-wider mr-2">
                      {isEdit ? 'SAVE CHANGES' : 'PUBLISH'}
                    </Text>
                    <Ionicons name="arrow-up" size={20} color="white" />
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
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-1 px-5">

        {/* --- Header --- */}
        <View className="flex-row justify-between items-center py-6">
          <View>
            <Text className="text-4xl font-light text-black tracking-tighter">Ink.</Text>
            <Text className="text-zinc-400 text-xs font-medium tracking-widest uppercase mt-1">My Collection</Text>
          </View>
          <TouchableOpacity onPress={() => signOut()} className="bg-zinc-50 p-3 rounded-full border border-zinc-100">
            <Ionicons name="log-out-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* --- Feed --- */}
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
            <View className="items-center justify-center mt-32 opacity-50">
              <Ionicons name="water-outline" size={48} color="#000" />
              <Text className="text-black text-xl font-light mt-4">Empty Canvas</Text>
              <Text className="text-zinc-400 text-center mt-2 max-w-[200px]">Start writing to fill this space.</Text>
            </View>
          }
        />

        {/* --- FAB: The Ink Button --- */}
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="absolute bottom-10 right-6 bg-black w-16 h-16 rounded-full items-center justify-center shadow-2xl shadow-black/40"
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>

        {/* --- Modals --- */}
        <Modal visible={createModalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
          {renderForm(false)}
        </Modal>
        <Modal visible={!!editPost} animationType="slide" transparent={true} onRequestClose={closeModal}>
          {renderForm(true)}
        </Modal>

      </View>
    </SafeAreaView>
  );
}