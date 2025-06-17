import { createContext, useMemo } from "react";
import { RTCPeerConnection } from "react-native-webrtc";
const PeerContext = createContext(null)

export const PeerProvider = ({children})=>{
    const peer = useMemo(()=> new RTCPeerConnection({
        iceServers:[{
            urls:[
                "stun:stun.l.google.com:19302",
                "stun:google.stun.twilio.com:3478"
            ]
        }]
    }),[])

    const createOffer = async()=>{
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        return offer
    }
    return <PeerContext.Provider value={{peer,createOffer}}>{children}</PeerContext.Provider>
}