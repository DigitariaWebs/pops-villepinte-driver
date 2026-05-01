import {
  useFonts as useBebasNeue,
  BebasNeue_400Regular,
} from "@expo-google-fonts/bebas-neue";
import {
  useFonts as usePoppins,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export function useAppFonts(): boolean {
  const [bebasLoaded] = useBebasNeue({ BebasNeue_400Regular });
  const [poppinsLoaded] = usePoppins({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return bebasLoaded && poppinsLoaded;
}
