/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import Webcam from "react-webcam";
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/types";
import { draw } from "../libs/mask";
import styles from "../styles/Home.module.css";
import * as bodyPix from "@tensorflow-models/body-pix";
import sample from "../assets/sample.png";
import { useBodyPix } from "../libs/createBodyPixStream";

function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, segment, video } = useBodyPix();

  useEffect(() => {
    if (!segment) return;
    segmentBody(video, canvasRef.current!);
  }, [segment]);

  async function segmentBody(input, output) {
    const net = await bodyPix.load();
    async function renderFrame() {
      const segmentation = await net.segmentPerson(input);
      const backgroundBlurAmount = 10;
      const edgeBlurAmount = 10;
      const flipHorizontal = true;
      bodyPix.drawBokehEffect(
        output,
        input,
        segmentation,
        backgroundBlurAmount,
        edgeBlurAmount,
        flipHorizontal
      );
      requestAnimationFrame(renderFrame);
    }
    renderFrame();
  }

  // const useFaceDetect = async () => {
  //   const model = await faceLandmarksDetection.load(
  //     faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  //   );
  //   detect(model);
  // };

  // const detect = async (model: MediaPipeFaceMesh) => {
  //   if (!webcam.current || !canvas.current) return;
  //   const webcamCurrent = webcam.current as any;
  //   if (webcamCurrent.video.readyState !== 4) {
  //     detect(model);
  //   }
  //   const video = webcamCurrent.video;
  //   const videoWidth = webcamCurrent.video.videoWidth;
  //   const videoHeight = webcamCurrent.video.videoHeight;
  //   canvas.current.width = videoWidth;
  //   canvas.current.height = videoHeight;
  //   const predictions = await model.estimateFaces({
  //     input: video,
  //   });
  //   const ctx = canvas.current.getContext("2d") as CanvasRenderingContext2D;
  //   requestAnimationFrame(() => {
  //     draw(predictions, ctx, videoWidth, videoHeight);
  //   });
  //   detect(model);
  //   return;
  // };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.videoList}>
          {stream && (
            <video
              className={styles.video}
              muted
              autoPlay
              ref={(video) =>
                video &&
                video.srcObject !== stream &&
                (video.srcObject = stream)
              }
            />
          )}
          {segment && (
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              width={segment.width}
              height={segment.height}
            />
          )}
        </div>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}

export default Home;
