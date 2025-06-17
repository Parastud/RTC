import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { mediaDevices } from 'react-native-webrtc';
import { useSocket } from '../../context/Socketprovider';
import { UsernameState } from "../../store/store";

const Room = () => {
  const { getUser } = UsernameState();
  const socket = useSocket();
  const { id } = useLocalSearchParams();
  const Navigation = useNavigation();

  const [Msgs, setMsgs] = useState([]);
  const [Msg, setMsg] = useState('');
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    Navigation.setOptions({ title: `${id}` });
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", handleReceivemsg);
    socket.on("joined", handlejoin)

    return () =>{
      socket.off("receiveMessage",handleReceivemsg), 
      socket.off("joined",handlejoin)}
  }, [socket]);

  const HandleChange = (text) => setMsg(text);

  const handlejoin = useCallback(({Username,type})=>{
      setMsgs(prevMsgs => [...prevMsgs, { Username,type }])
      console.log(Username)
  },[])

  const handleReceivemsg = useCallback(({ message, Username,type }) => {
      setMsgs(prevMsgs => [...prevMsgs, { Username, message,type }])
    },[])

  const HandleMsgSend = () => {
    if (Msg.trim() === "") return;
    socket.emit("sendMessage", { roomId: id, message: Msg, Username: getUser()?.Username });
    setMsg("");
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
      } catch (e) {
        console.error("Camera Error", e);
      }
    };
    startCamera();
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={{ width: '100%', height: 300 }}
          objectFit="cover"
        />
      )} */}

      <FlatList
        data={Msgs}
        keyExtractor={(item, index) => `${item.Username}-${index}`}
        renderItem={({ item }) => (
          <View className="p-2 my-1 bg-gray-100 rounded">
            {item?.type=="alert" && 
            <Text>{item.Username} Joined the room</Text>}
            {item?.type=="msg" &&
            <><Text className="font-bold">{item.Username}</Text><Text>{item.message}</Text></> }
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
