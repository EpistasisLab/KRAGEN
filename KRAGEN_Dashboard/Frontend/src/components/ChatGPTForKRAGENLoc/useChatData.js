// useChatData.js
import { useState, useEffect } from "react";
import { getChatMessageByExperimentId } from "../apiService";
function useChatData(experimentId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getChatMessageByExperimentId(experimentId);
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (experimentId) {
      fetchData();
    }
  }, [experimentId]);

  return { data, isLoading, error };
}

export default useChatData;
