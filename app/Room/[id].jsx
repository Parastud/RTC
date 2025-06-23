import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, View } from 'react-native';
import { mediaDevices, RTCView } from 'react-native-webrtc';
import ToastManager, { Toast } from 'toastify-react-native';
import { usePeer } from '../../context/Peerprovider';
import { useSocket } from '../../context/Socketprovider';
import Chat from '../../OtherScreens/Chat';
import { UsernameState } from "../../store/store";

const Room = () => {
  const { peer, createOffer, createAnswer, SetRemoteAnswer, sendStream, RemoteStream } = usePeer()
  const { getUser } = UsernameState();
  const socket = useSocket();
  const Navigation = useNavigation();
  const [Msgs, setMsgs] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const bottomSheet = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '75%', '100%','1000'], [])

  const popup = ()=>{bottomSheet.current?.snapToIndex(2)}

  useEffect(() => {
    Navigation.setOptions({ title: `${getUser()?.RoomId}` });
  }, []);

  useEffect(() => {
    sendStream(localStream)
  }, [localStream])

  const Renegotiate = () => {
    const offer = peer.localDescription
    socket.emit('call', { room: getUser()?.RoomId, offer })
  }


  useEffect(() => {
    socket.on("receiveMessage", handleReceivemsg);
    socket.on("joined", handlejoin)
    socket.on("incall", handlecall)
    socket.on("accepted", handleaccepted)

    return () => {
      socket.off("receiveMessage", handleReceivemsg),
        socket.off("joined", handlejoin)
      socket.off("incall", handlecall)
      socket.off("accepted", handleaccepted)
    }
  }, [socket]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream)
      } catch (e) {
        console.error("Camera Error", e);
      }
    };
    startCamera();
  }, []);

  const handleaccepted = useCallback(async ({ ans }) => {
    await SetRemoteAnswer(ans)
    Renegotiate()

  }, [handleaccepted, localStream])

  const handlecall = useCallback(async ({ offer }) => {
    const ans = await createAnswer(offer)
    socket.emit("accept", { ans, room: getUser()?.RoomId })
  }, [handlecall, socket, createAnswer])

  const handlejoin = useCallback(async ({ Username, type }) => {
    const offer = await createOffer()
    socket.emit('call', { room: getUser()?.RoomId, offer })
    Toast.success(`${Username} Joined the Room`)
    setMsgs(prevMsgs => [...prevMsgs, { Username, type }])
  }, [createOffer])

  const handleReceivemsg = useCallback(({ message, Username, type }) => {
    setMsgs(prevMsgs => [...prevMsgs, { Username, message, type }])
  }, [handleReceivemsg])

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ToastManager />
      <Pressable onPress={popup} className="absolute right-2">
      <MaterialIcons name="chat" color="black" size={36}  />
      </Pressable>
  {RemoteStream && (
    <View className="w-full h-full">
      <RTCView
      streamURL={localStream?.toURL()}
      style={{
        width: '50%',
        height: '30%',
        zIndex: 20,
        position: 'absolute',
        right: 10,
        bottom: 10,
        borderWidth: 1,
        borderColor: '#fff',
      }}
      objectFit="cover"
    />
    <RTCView
      streamURL={RemoteStream?.toURL()}
      style={{
        width: '100%',
        height: '100%',
        zIndex: 10,
        position: 'absolute',
      }}
      objectFit="cover"
    />
        
        
    </View>
  )}

  {(localStream && !RemoteStream) && (
    <RTCView
      streamURL={localStream?.toURL()}
      style={{
        width: '50%',
        height: '30%',
        zIndex: 20,
        position: 'absolute',
        right: 10,
        bottom: 10,
        borderWidth: 1,
        borderColor: '#fff',
      }}
      objectFit="cover"
    />
  )}

      <BottomSheet
        ref={bottomSheet}
        snapPoints={snapPoints}
        index={-1}
        containerStyle={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture
        enableHandlePanningGesture
        enableOverDrag
        enableDynamicSizing={false}
        backdropComponent={(props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={2}
        pressBehavior="close"
      />
    )}    
      >
        <Chat Msgs={Msgs} />
      </BottomSheet>
      
    </SafeAreaView>
  );
};

export default Room;
