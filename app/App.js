import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync } from "expo-image-manipulator";
import * as Crypto from "expo-crypto";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  const [photo, setPhoto] = useState(null);
  const [hashKey, setHashKey] = useState(null);
  const [feedbackText, setFeedbackText] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
      await MediaLibrary.requestPermissionsAsync(true);
    })();
  }, []);

  const sendHashToServer = async (hash) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: hash }),
    };

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/save_token`,
        requestOptions
      );
      const text = await response.text();

      if (response.ok) {
        setFeedbackText("Image uploaded successfully!");
      } else {
        setFeedbackText("Error occurred while uploading the image.");
      }
    } catch (error) {
      setFeedbackText("Error occurred while uploading the image.");
      console.error("Error:", error);
    }
  };

  const takePhoto = async () => {
    let result1 = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });
    if (result1.canceled) {
      return;
    }
    setFeedbackText("Loading...");
    const uri = result1.assets[0].uri;
    const result2 = await manipulateAsync(
      uri,
      [],
      { format: "png", base64: true, compress: 0 } // Specify the desired format and disable base64 encoding
    );
    await MediaLibrary.saveToLibraryAsync(result2.uri);

    setPhoto(result2.uri);
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      result2.base64.slice(0, 100).toLowerCase()
    );
    sendHashToServer(hash);
  };

  return (
    <View style={styles.container}>
      <Button title="Take Photo" onPress={takePhoto} />
      {photo && <Image source={{ uri: photo }} style={styles.photo} />}
      {/* {hashKey && <Text style={styles.hashKey}>{hashKey}</Text>} */}
      {feedbackText && <Text>{feedbackText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  hashKey: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
