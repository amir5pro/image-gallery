import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { projectStorage, projectFirestore } from "../firebase/config";
import { serverTimestamp, collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const useStorage = (file) => {
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);

  const uniqueId = uuidv4();
  const dynamicFileName = uniqueId + "_" + file.name;
  const storageRef = ref(projectStorage, "images/" + dynamicFileName);
  const uploadTask = uploadBytesResumable(storageRef, file);

  useEffect(() => {
    const unsubscribe = uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percentage = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        setProgress(percentage);
      },
      (error) => {
        toast.error(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(projectFirestore, "images"), {
            url: downloadURL,
            timestamp: serverTimestamp(),
          });

          setUrl(downloadURL);
          toast.success(<p>image added successfully</p>);
        } catch (error) {
          toast.error(error);
        }
      }
    );
    return () => {
      unsubscribe();
    };
  }, [file]);

  return { progress, url };
};

export default useStorage;
