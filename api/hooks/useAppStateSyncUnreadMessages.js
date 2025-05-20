// hooks/useAppStateSyncUnreadMessages.js
import { useEffect } from "react";
import { AppState } from "react-native";
import { useDispatch } from "react-redux";
import { getAxiosClient } from "../client";
import { setUnreadMessages } from "../../store/badgesSlice"; // update action name if needed

export const useAppStateSyncUnreadMessages = (storeId = null) => {
    const dispatch = useDispatch();
    const axiosClient = getAxiosClient();

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const response = await axiosClient.get(`/chats/stores/${storeId}/unread`);
                if (response?.data) {
                    console.log("Fetched unread messages:", response.data);
                    dispatch(setUnreadMessages(response.data));
                }
            } catch (error) {
                console.error("Failed to fetch unread messages:", error);
            }
        };

        const handleAppStateChange = (nextAppState) => {
            console.log("App state changed to", nextAppState);
            if (nextAppState === "active") {
                if (storeId) {
                    console.log("Fetching unread messages...");
                    fetchUnread();
                }

            }
        };

        const subscription = AppState.addEventListener("change", handleAppStateChange);
        return () => subscription.remove();
    }, [storeId]);
};