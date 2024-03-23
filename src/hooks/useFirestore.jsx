import { useState, useEffect } from "react";
import { projectFirestore } from "../firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

const useFirestore = (imageCollection) => {
  const [docs, setDocs] = useState([]);
  useEffect(() => {
    const q = query(
      collection(projectFirestore, imageCollection),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setDocs(documents);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  return { docs };
};

export default useFirestore;
