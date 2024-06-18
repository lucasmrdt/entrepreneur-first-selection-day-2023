import React, { useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadstart = () => {
      setIsLoading(true);
      setFeedbackText("Uploading image...");
    };

    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1]; // Extract base64 data (remove 'data:image/jpeg;base64,')

      console.log("base64:", base64Data.slice(0, 100));

      // Send base64Data to the server
      sendImageToServer(base64Data.slice(0, 100).toLowerCase());
    };

    reader.onerror = () => {
      setIsLoading(false);
      setFeedbackText("Error occurred while uploading the image.");
    };

    reader.readAsDataURL(file);
  };

  const sendImageToServer = async (base64Data) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data }),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/check_duplicate`,
        requestOptions
      );
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        if (data.res) {
          setFeedbackText("Image is certify ✅");
        } else {
          setFeedbackText("Image is probably corrupted ❌");
        }
      } else {
        setFeedbackText("Error occurred while uploading the image.");
      }
    } catch (error) {
      setIsLoading(false);
      setFeedbackText("Error occurred while uploading the image.");
      console.error("Error:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <input
        accept="image/*"
        id="imageUpload"
        type="file"
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      <label htmlFor="imageUpload">
        <Button variant="contained" component="span">
          Upload Image
        </Button>
      </label>
      {isLoading && <CircularProgress style={{ marginTop: 10 }} />}
      {feedbackText && (
        <Typography variant="body1" style={{ marginTop: 10 }}>
          {feedbackText}
        </Typography>
      )}
    </div>
  );
};

export default App;
