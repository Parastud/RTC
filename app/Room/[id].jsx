import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { mediaDevices, RTCView } from 'react-native-webrtc';
import { usePeer } from '../../context/Peerprovider';
import { useSocket } from '../../context/Socketprovider';
import { UsernameState } from "../../store/store";

const Room = () => {
  const { peer, createOffer, createAnswer, SetRemoteAnswer, sendStream, RemoteStream } = usePeer()
  const { getUser } = UsernameState();
  const socket = useSocket();
  const Navigation = useNavigation();
  const [Msgs, setMsgs] = useState([]);
  const [Msg, setMsg] = useState('');
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    Navigation.setOptions({ title: `${getUser()?.RoomId}` });
  }, []);

  useEffect(() => {
    sendStream(localStream)
  }, [localStream])

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
  }, [handleaccepted, localStream])

  const handlecall = useCallback(async ({ offer }) => {
    const ans = await createAnswer(offer)
    socket.emit("accept", { ans, room: getUser()?.RoomId })
  }, [handlecall, socket, createAnswer])

  const handlejoin = useCallback(async ({ Username, type }) => {
    const offer = await createOffer()
    socket.emit('call', { room: getUser()?.RoomId, offer })
    setMsgs(prevMsgs => [...prevMsgs, { Username, type }])
  }, [createOffer])

  const handleReceivemsg = useCallback(({ message, Username, type }) => {
    setMsgs(prevMsgs => [...prevMsgs, { Username, message, type }])
  }, [handleReceivemsg])

  const HandleMsgSend = () => {
    if (Msg.trim() === "") return;
    socket.emit("sendMessage", { roomId: getUser()?.RoomId, message: Msg, Username: getUser()?.Username });
    setMsg("");
  };

  const HandleChange = (text) => setMsg(text);

  return (
    <View className="flex-1 bg-white">
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{ width: '100%', height: 300 }}
          objectFit="cover"
        />
      )}
      {RemoteStream && (
        <RTCView
          streamURL={RemoteStream.toURL()}
          style={{ width: '100%', height: 300 }}
          objectFit="cover"
        />
      )}

      <FlatList
        data={Msgs}
        keyExtractor={(item, index) => `${item.Username}-${index}`}
        renderItem={({ item }) => (
          <View className="p-2 my-1 bg-gray-100 rounded">
            {item?.type == "alert" &&
              <Text>{item.Username} Joined the room</Text>}
            {item?.type == "msg" &&
              <><Text className="font-bold">{item.Username}</Text><Text>{item.message}</Text></>}
          </View>
        )}
      />

      <View className="flex-row items-center bg-gray-200 p-2">
        <TextInput
          placeholder='Enter Msg'
          value={Msg}
          onChangeText={HandleChange}
          className="flex-1 bg-white p-2 rounded"
        />
        <TouchableOpacity onPress={HandleMsgSend} className="ml-2">
          <Text>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Room;
