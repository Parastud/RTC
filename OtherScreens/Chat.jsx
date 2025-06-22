import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSocket } from '../context/Socketprovider';
import { UsernameState } from '../store/store';
const Chat = ({ Msgs }) => {
    const { getUser } = UsernameState();
    const socket = useSocket()
    const HandleMsgSend = () => {
        if (Msg.trim() === "") return;
        socket.emit("sendMessage", { roomId: getUser()?.RoomId, message: Msg, Username: getUser()?.Username });
        setMsg("");
    };

    const HandleChange = (text) => setMsg(text);
    const [Msg, setMsg] = useState('');
    return (
        <BottomSheetView >
            <BottomSheetFlatList
                data={Msgs}
                keyExtractor={(item, index) => `${item.Username}-${index}`}
                contentContainerStyle={{ padding: 10 }}
                inverted
                scrollEnabled={true}
                focusHook={useFocusEffect}
                renderItem={({ item }) => (
                    <View className="p-2 my-1 bg-gray-100 rounded">
                        {item?.type == "join" &&
                            <Text>{item.Username} Joined the room</Text>}
                        {item?.type == "left" &&
                            <Text>{item.Username} Left the room</Text>}
                        {item?.type == "msg" &&
                            <><Text className="font-bold">{item.Username}</Text><Text>{item.message}</Text></>}
                    </View>
                )}
            />

            <View className="absolute m-24 bg-gray-200 rounded" >
                <BottomSheetTextInput
                    placeholder='Enter Msg'
                    value={Msg}
                    onChangeText={HandleChange}
                    className="flex-1 bg-white p-2 rounded"
                />
                <TouchableOpacity onPress={HandleMsgSend} className="ml-2">
                    <MaterialIcons name="send" color="blue" size={20} />
                </TouchableOpacity>
            </View>
        </BottomSheetView>
    )
}

export default Chat