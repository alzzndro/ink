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

// --- NEW UI: Dark Industrial Card ---
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
    // Bg: Slate-900 (Dark), Border: Slate-800
    <View className="bg-slate-900 mb-5 mx-1 rounded-2xl shadow-sm shadow-black/50 border border-slate-800 overflow-hidden">

      {/* 2. CONTENT SECTION */}
      <View className="p-5">

        {/* Header: User & Date */}
        <View className="flex-row items-center mb-3">
          <View className="h-6 w-6 rounded-md bg-slate-800 items-center justify-center mr-2 border border-slate-700">
            <Text className="text-[10px] font-black text-slate-300">
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Title & Desc */}
        <Text className="text-xl font-black text-white mb-2 leading-tight tracking-tight">
          {item.title}
        </Text>
        <Text className="text-slate-400 text-sm leading-relaxed mb-5 font-medium">
          {item.description}
        </Text>

        {/* 1. MEDIA SECTION */}
        {item.media_url && (
          <View className="w-full h-56 bg-slate-950 relative border-b border-slate-800">
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
            <View className="absolute top-3 right-3 bg-black/80 border border-slate-800 px-2 py-1 rounded-md">
              <Ionicons
                name={item.media_type === 'video' ? 'videocam' : 'image'}
                size={12}
                color="#94a3b8"
              />
            </View>
          </View>
        )}

        {/* 3. FOOTER ACTIONS */}
        <View className="border-t border-slate-800 pt-4 flex-row justify-end space-x-3">
          <TouchableOpacity
            onPress={() => onEdit(item)}
            className="flex-row items-center px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg active:bg-slate-700"
          >
            <Ionicons name="create-outline" size={16} color="#cbd5e1" />
            <Text className="ml-2 text-slate-300 font-bold text-xs uppercase">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            className="flex-row items-center px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg active:bg-red-900/20 active:border-red-900"
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
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

  // --- NEW UI: Bottom Sheet Form (Dark Mode) ---
  const renderForm = (isEdit: boolean) => {
    const currentTitle = isEdit ? editPost?.title : title;
    const currentDesc = isEdit ? editPost?.description : description;
    const setterTitle = isEdit ? (t: string) => setEditPost(prev => prev ? { ...prev, title: t } : null) : setTitle;
    const setterDesc = isEdit ? (d: string) => setEditPost(prev => prev ? { ...prev, description: d } : null) : setDescription;
    const action = isEdit ? handleUpdate : handleSubmit;
    const close = isEdit ? () => setEditPost(null) : () => setCreateModalVisible(false);

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-black/80">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="bg-slate-900 w-full rounded-t-[32px] p-8 h-[90%] shadow-2xl border-t border-slate-800">

            {/* Modal Handle */}
            <View className="items-center mb-8">
              <View className="w-12 h-1 bg-slate-700 rounded-full" />
            </View>

            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {isEdit ? "Update" : "Compose"}
                </Text>
                <Text className="text-3xl font-black text-white tracking-tight">
                  {isEdit ? "Edit Entry" : "New Entry"}
                </Text>
              </View>
              <TouchableOpacity onPress={close} className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full items-center justify-center">
                <Ionicons name="close" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <View className="space-y-6">
              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Title</Text>
                <TextInput
                  value={currentTitle}
                  onChangeText={setterTitle}
                  className="bg-slate-800 border border-slate-700 focus:border-slate-500 text-white p-5 rounded-xl text-lg font-bold"
                  placeholder="Subject..."
                  placeholderTextColor="#64748b"
                />
              </View>

              <View>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Content</Text>
                <TextInput
                  value={currentDesc}
                  onChangeText={setterDesc}
                  multiline
                  className="bg-slate-800 border border-slate-700 focus:border-slate-500 text-slate-300 p-5 rounded-xl min-h-[140px] text-base leading-6 font-medium"
                  placeholder="Type your notes here..."
                  placeholderTextColor="#64748b"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              <View>
                <TouchableOpacity
                  onPress={pickMedia}
                  className={`border-2 border-dashed rounded-xl h-20 items-center justify-center flex-row space-x-3 ${mediaFile ? 'bg-slate-800 border-emerald-600' : 'bg-slate-900 border-slate-700'}`}
                >
                  {mediaFile ? (
                    <>
                      <Ionicons name="checkmark-done-circle" size={24} color="#10b981" />
                      <Text className="text-emerald-400 font-bold">Media Ready</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={24} color="#64748b" />
                      <Text className="text-slate-500 font-bold">Attach Media</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={action}
                disabled={loading}
                className={`w-full py-5 rounded-xl mt-2 shadow-lg flex-row justify-center items-center ${loading ? 'bg-slate-700' : 'bg-white shadow-white/10'}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-slate-900 text-lg font-black mr-2 tracking-wide">
                      {isEdit ? 'SAVE CHANGES' : 'PUBLISH NOTE'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#0f172a" />
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
    // Main BG: Slate-950 (Very dark charcoal)
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top']}>
      <StatusBar style="light" />
      <View className="flex-1 px-5">

        {/* --- Header (Dark Mode) --- */}
        <View className="flex-row justify-between items-end pb-6 pt-4 border-b border-slate-800 mb-4">
          <View>
            <Text className="text-3xl font-black text-white tracking-tighter">Note--</Text>
          </View>
          <TouchableOpacity
            onPress={() => signOut()}
            className="flex-row items-center bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 shadow-sm active:bg-slate-800"
          >
            <Text className="text-xs font-bold text-slate-400 mr-2">LOGOUT</Text>
            <Ionicons name="log-out-outline" size={16} color="#ef4444" />
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
            <View className="items-center justify-center mt-32 opacity-60">
              <View className="w-24 h-24 bg-slate-900 rounded-2xl items-center justify-center mb-6 border border-slate-800">
                <Ionicons name="file-tray-outline" size={48} color="#475569" />
              </View>
              <Text className="text-white text-xl font-black tracking-tight">NO RECORDS</Text>
              <Text className="text-slate-500 text-center mt-2 font-medium">Your workspace is empty.</Text>
            </View>
          }
        />

        {/* --- FAB (White for High Contrast) --- */}
        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="absolute bottom-8 self-center bg-white px-6 py-4 rounded-full shadow-2xl shadow-white/20 flex-row items-center"
        >
          <Ionicons name="add" size={24} color="#0f172a" />
          <Text className="text-slate-900 font-black text-base ml-2 tracking-wide uppercase">New Entry</Text>
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