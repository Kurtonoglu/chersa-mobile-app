# SDK Compatibility Log

## Status: Project is on Expo SDK 54

This document tracks the dependency audit done to ensure the project runs correctly
with Expo Go (Supported SDK: 54).

---

## What Was Found

When investigating why Expo Go wasn't loading the app (QR scanned → nothing happened),
the project was audited. The `expo` package was already pinned to `~54.0.0` in
`package.json` (installed: `54.0.33`), and **all packages were SDK 54-compatible**
except one:

| Package | Was | Fixed To | Status |
|---|---|---|---|
| `@types/react` | `~19.0.0` | `~19.1.10` | ✅ Fixed |

All other packages (`expo-router ~6.0.23`, `react-native 0.81.5`, `react 19.1.0`,
`react-native-safe-area-context ~5.6.0`, etc.) were already compatible with SDK 54.

Verification command used: `npx expo install --check` → result after fix: **"Dependencies are up to date"**

---

## SDK 54 Package Baseline (for reference)

These are the current package versions confirmed compatible with Expo SDK 54:

```
expo                               ~54.0.0      (installed 54.0.33)
expo-router                        ~6.0.23
expo-auth-session                  ~7.0.10
expo-constants                     ~18.0.13
expo-dev-client                    ~6.0.20
expo-device                        ~8.0.10
expo-linking                       ~8.0.11
expo-localization                  ~17.0.8
expo-notifications                 ~0.32.16
expo-status-bar                    ~3.0.9
expo-web-browser                   ~15.0.10
react                              19.1.0
react-dom                          19.1.0
react-native                       0.81.5
react-native-safe-area-context     ~5.6.0
react-native-screens               ~4.16.0
react-native-web                   ^0.21.0
@react-native-async-storage/async-storage  2.2.0
@types/react                       ~19.1.10     ← changed from ~19.0.0
typescript                         ~5.9.2
```

---

## If You Want to Move to SDK 55

When Expo releases SDK 55 and your Expo Go app is updated to support it:

1. Run: `npx expo install expo@~55.0.0`
2. Run: `npx expo install --fix` to auto-upgrade all packages
3. Run: `npm install --legacy-peer-deps`
4. Run: `npx expo install --check` to verify no remaining issues

No code changes are expected to be required — SDK 54 → SDK 55 is a minor jump.

---

## Why QR Scan Might Still Not Work

If after this fix the app still doesn't load in Expo Go, the issue is likely **network**
not SDK version:

- Phone and PC must be on the **same Wi-Fi network**
- Some corporate/university Wi-Fi networks block device-to-device communication
- Try: `npx expo start --tunnel` (uses ngrok, works across any network)
- Try: `npx expo start --lan` or `--localhost`
- Check Windows Firewall isn't blocking port 8081

---

*Audit date: 2026-03-09*
