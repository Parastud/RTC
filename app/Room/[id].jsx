import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSocket } from '../../context/Socketprovider';
import useRTCStore from "../../store/store";
const Room = () => {
  const rtc = useRTCStore(state => state.getRTC());
  const [Msgs, setMsgs] = useState([])
  const socket = useSocket();
  const Navigation = useNavigation();
  const { id } = useLocalSearchParams();
  useLayoutEffect(() => {
    Navigation.setOptions({
      title: `${id}`,
    });
  }, []);

  const [Msg, setMsg] = useState("")

  const HandleChange = (text) => {
    setMsg(text);
  }
  const HandleMsgSend = () => {
    if (Msg.trim() === "") {
      return;
    }
    socket.emit("sendMessage", { roomId: id, message: Msg, Username: rtc?.Username });
    setMsg("");
  }

  useEffect(() => {
    socket.on("receiveMessage", ({ message, Username }) => {
      setMsgs((prevMsgs) => [
        ...prevMsgs,
        { Username, message }
      ]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [socket]);





  return (
    <View className="absolute left-0 right-0 p-4 bottom-0">
      <FlatList
        data={Msgs}
        keyExtractor={(item, index) => `${item.Username}-${index}`}
        renderItem={({ item }) => (
          <View className="p-2 my-1 bg-white rounded shadow">
            <Text className="font-bold">{item.Username}</Text>
            <Text>{item.message}</Text>
          </View>
        )}
      />
      <View className="p-4 bg-gray-200 rounded">
        <TextInput placeholder='Enter Msg' value={Msg} onChangeText={HandleChange} />
        <TouchableOpacity className="absolute right-0 top-5" onPress={HandleMsgSend}>
          <MaterialIcons name="send" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Room


