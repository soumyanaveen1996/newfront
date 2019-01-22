import I18n from 'react-native-i18n';

I18n.fallbacks = true;

I18n.translations = {
    en: {
        FrontM: 'FrontM',
        React_Native: 'React Native',
        MainMenu: 'Main',
        Home: 'Home',
        Description:
            'React Native helps us build cross platform native apps in Javascript.',
        WebM_Bot: 'WebM',
        Search_conv: 'Search Conversation',
        No_balance: "Oops! You don't have credits to make the call",
        WebM_Bot_Desc: 'Search the web - chat style!',
        Betty_Bot: 'Betty Botter',
        Betty_Bot_Desc: 'Play the Betty Botter Game',
        Chat_Input_Camera: 'Camera',
        Chat_Input_Video: 'Video',
        Chat_Input_Photo_Library: 'Photo/Video Library',
        Chat_Input_OCR: 'OCR',
        Chat_Input_BarCode: 'Barcode Reader',
        Add_Contact: 'Add Contact',
        My_Contacts: 'My Contacts',
        My_Channels: 'My Channels',
        My_Bots: 'My Bots',
        Favorites: 'Favorites',
        Contacts: 'Contacts',
        Channels: 'Channels',
        ChatBots: 'Chatbots',
        Configure: 'Configure',
        Authenticate: 'Authenticate',
        Bot_Store: 'Marketplace',
        Featured: 'Featured',
        Developer: 'Company',
        Categories: 'Categories',
        Featured_Tab: 'Featured',
        Developer_Tab: 'Providers',
        Categories_Tab: 'Categories',
        Bots: 'Bots',
        Filters: 'Filters',
        Search: 'Search',
        Installed_bots: 'Installed Bots',
        Done: 'Done',
        Done_caps: 'DONE',
        Button: 'Button',
        Image_Save_Failed: 'Saving the image to the Photo Album failed.',
        Image_Save_Success: 'Saved the image to the Photos Album',
        Slider_Response_Message: 'You selected : \n{{lines}}',
        Button_Message: 'Select : \n{{lines}}',
        Slider_Response: '{{lines}}',
        SNR_Chart_title: 'Signal to Noise ratio',
        Conversations: 'Chats',
        Bot_uninstalled: 'Bot uninstalled',
        Bot_uninstall_failed: 'Bot uninstall failed',
        Bot_installed: 'Bot installed',
        Bot_install_failed: 'Bot install failed',
        Bot_updated: 'Bot updated',
        Bot_update_failed: 'Bot update failed',
        Bot_uninstall_confirmation:
            'Are you sure you want to uninstall the bot ?',
        Install: 'Install',
        Installed: 'Installed',
        Update_Bot: 'UPDATE',
        Tap_To_Load: 'Tap to Load Image',
        Tap_on_Map: 'Long Press on the Map to select a location',
        Tap_on_Map_to_Change:
            'Long Press on another location if you want to change',
        Pick_Location: 'Pick Location',
        Name: 'Name',
        Email: 'Email',
        Screen_Name: 'Screen Name',
        UUID: 'uuid',
        Given_Name: 'Given Name',
        Sur_Name: 'Sur Name',
        Chats: 'Chats',
        Reset_Conversation: 'Reset Conversation',
        Network_Error_Title: 'Connection Issues',
        Network_Error_Content:
            'It appears we are having trouble connecting to the internet. Please retry in some time.',
        Retry_Now: 'Retry Now',
        Cancel: 'Cancel',
        Use: 'Use',
        OPEN: 'Open',
        Web_content_shown: 'Web content shown',
        Bot_load_failed_title: 'Bot load failed',
        Bot_load_failed:
            'It appears we are having trouble connecting to the internet. Please retry in some time.',
        Bot_max_version_error:
            'The current version is bot is incompatible with the app. Please visit the Installed bots screen to update the bot.',
        Bot_min_version_error:
            'The current version of the app cannot run the new version of the bot. Please update the app from the app store.',
        Take_picture: 'Take a picture',
        Select_image: 'Select an image',
        Fill_form: 'Please fill the form',
        View_form: 'View the form details',
        Close: 'Close',
        Yes: 'Yes',
        Confirm: 'Confirm',
        Call_Message:
            'Available when you connect over Satellite broadband (L-Band, Ka-Band)',
        Password_not_empty: 'Please enter password',
        Not_a_number: 'Please enter number',
        Not_an_email: 'Please enter valid email',
        Field_mandatory: 'Field is mandatory',
        Channel_unsubscribed: 'Unsubscribed from the channel',
        Channel_unsubscribe_failed: 'Failed to unsubscribe from the channel',
        Channel_subscribed: 'Subscribed Channel',
        Channel_subscribe_failed: 'Failed to subscribe to the channel',
        Unknown: 'Unknown',
        No_Network: 'No network connection',
        Satellite_connection: 'Online over Satellite',
        Connection_Type: 'Connection Type',
        Satellite_Message:
            'You are in Satellite Network Mode which ensures minimum data consumption with a near real time message exchange.',
        Gsm_Message:
            'You are in Terrestrial Network Mode which provides a real time messaging experience.',
        Auto_Message:
            'You are in Automatic Network Mode which ensures optimal data consumption when you switch between Terrestrial Cellular/GSM/Broadband network and Satellite networks.',
        Ok: 'Ok',
        Password_error: 'Please enter a valid password value',
        Retry_Password_error: 'Password and retry password should match',
        Enable_GPS_title: 'Enable GPS',
        Enable_GPS_to_view_currentLocation:
            'GPS is disabled in your device. Please enable GPS to view your current location.',
        Quota: 'Quota',
        Quota_unavailable:
            "Currently, you don't have enough quota to send messages. Please ask your admin for more quota",
        Channel_admin_unsubscribe:
            'You are the only admin for this channel. Please make another user an admin and then unsubscribe',
        Discover: 'Discover',
        Activate_Enterprise_Bots: 'Sign in to a new Provider',
        Initializing: 'Initializing',
        Calling: 'Calling',
        From: 'From',
        Dial: 'Dialpad',
        Enter_valid_number: 'Please enter a valid phone number',
        Delete: 'Delete',
        New_chat: 'New Chat',
        Contacts_call: 'Contacts_call',
        Dial_call: 'Dial_call',
        Iridium_message:
            'Our team is working hard to be able to initiate calls to Iridium phones. Stay in touch and we will inform you when it becomes available',
        Thuraya_message:
            'Our team is working hard to be able to initiate calls to Thuraya phones. Stay in touch and we will inform you when it becomes available',
        Add_participants: 'Add participants',
        Add_new_contacts: 'Add new contacts',
        Select_team: 'Select Team',
        Share_Contact: 'Share contact',
        SAVE: 'Save',
        Search_my_info_text: "I don't want to appear in searches",
        Share_my_info_text: 'Share my information with my contacts',
        Add_phone: 'Add phone',
        Camera_option: 'Camera',
        Gallery_option: 'Photo Library',
        Bar_code_option: 'Code',
        File_option: 'File',
        Contact_option: 'Contact',
        Location_option: 'Location'
    }
};

export default I18n;
