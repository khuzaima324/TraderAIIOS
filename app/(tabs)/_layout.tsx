// import * as Haptics from "expo-haptics";
// import { Tabs } from "expo-router";
// import React from "react";

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: { display: "none" },
//         lazy: true,
//       }}
//       screenListeners={{
//         tabPress: () => {
//           requestAnimationFrame(() => {
//             Haptics.selectionAsync();
//           });
//         },
//       }}
//     >
//       <Tabs.Screen name="tracker" />
//       <Tabs.Screen name="signals" />
//       <Tabs.Screen name="history" />
//       <Tabs.Screen name="profile" />
//       <Tabs.Screen name="analyzer" />
//       {/* <Tabs.Screen name="index" options={{ href: null }} /> */}
//     </Tabs>
//   );
// }

import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Keep display: "none" only if you have a 100% custom bottom nav 
        // component rendered elsewhere.
        tabBarStyle: { display: "none" }, 
        lazy: true,
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.selectionAsync();
        },
      }}
    >
      <Tabs.Screen name="analyzer" />
      <Tabs.Screen name="signals" />
      <Tabs.Screen name="tracker" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}