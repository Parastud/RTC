import { MaterialIcons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
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
        <BottomSheetView>
            <BottomSheetFlatList
                data={Msgs}
                keyExtractor={(item, index) => `${item.Username}-${index}`}
                contentContainerStyle={{ padding: 10 }}
                inverted
                scrollEnabled={true}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                        <BottomSheetTextInput
                            placeholder='Enter Msg'
                            value={Msg}
                            onChangeText={HandleChange}
                            style={{ flex: 1, backgroundColor: 'gray', padding: 10, borderRadius: 8 }}
                        />
                        <TouchableOpacity onPress={HandleMsgSend} style={{ marginLeft: 8 }}>
                            <MaterialIcons name="send" color="blue" size={24} />
                        </TouchableOpacity>
                    </View>


        </BottomSheetView>
    )
}

export default Chat