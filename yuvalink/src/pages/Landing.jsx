import { useEffect } from "react";
import { supabase } from "../config/supabase";

function Landing() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.auth.getSession();

      console.log("Data:", data);
      console.log("Error:", error);
    }

    testConnection();
  }, []);

  return <div>YuvaLink</div>;
}

export default Landing;
