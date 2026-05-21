#!/bin/bash
# ============================================
#   GÉNÉRATION ICÔNES iOS - S-reptrack
#   À exécuter sur Mac uniquement
# ============================================

set -e

cd "$(dirname "$0")/.."

LOGO="src/assets/sreptrack-logo.png"
ICONSET="ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [ ! -f "$LOGO" ]; then
  echo "❌ Logo introuvable : $LOGO"
  exit 1
fi

if [ ! -d "$ICONSET" ]; then
  echo "📁 Dossier AppIcon.appiconset introuvable, création..."
  mkdir -p "$ICONSET"
fi

echo "🎨 Génération des icônes iOS depuis $LOGO"
echo ""

# Crée une version carrée avec fond noir (Apple refuse la transparence)
TMP_SQUARE="/tmp/sreptrack-icon-square.png"
sips -s format png "$LOGO" --out "$TMP_SQUARE" >/dev/null 2>&1

# Toutes les tailles requises par iOS
declare -a SIZES=(
  "20:AppIcon-20.png"
  "40:AppIcon-20@2x.png"
  "60:AppIcon-20@3x.png"
  "29:AppIcon-29.png"
  "58:AppIcon-29@2x.png"
  "87:AppIcon-29@3x.png"
  "40:AppIcon-40.png"
  "80:AppIcon-40@2x.png"
  "120:AppIcon-40@3x.png"
  "120:AppIcon-60@2x.png"
  "180:AppIcon-60@3x.png"
  "76:AppIcon-76.png"
  "152:AppIcon-76@2x.png"
  "167:AppIcon-83.5@2x.png"
  "1024:AppIcon-512@2x.png"
)

for entry in "${SIZES[@]}"; do
  SIZE="${entry%%:*}"
  NAME="${entry##*:}"
  sips -z "$SIZE" "$SIZE" "$TMP_SQUARE" --out "$ICONSET/$NAME" >/dev/null 2>&1
  echo "  ✅ $NAME ($SIZE x $SIZE)"
done

# Contents.json officiel Apple
cat > "$ICONSET/Contents.json" << 'EOF'
{
  "images" : [
    { "size" : "20x20", "idiom" : "iphone", "filename" : "AppIcon-20@2x.png", "scale" : "2x" },
    { "size" : "20x20", "idiom" : "iphone", "filename" : "AppIcon-20@3x.png", "scale" : "3x" },
    { "size" : "29x29", "idiom" : "iphone", "filename" : "AppIcon-29@2x.png", "scale" : "2x" },
    { "size" : "29x29", "idiom" : "iphone", "filename" : "AppIcon-29@3x.png", "scale" : "3x" },
    { "size" : "40x40", "idiom" : "iphone", "filename" : "AppIcon-40@2x.png", "scale" : "2x" },
    { "size" : "40x40", "idiom" : "iphone", "filename" : "AppIcon-40@3x.png", "scale" : "3x" },
    { "size" : "60x60", "idiom" : "iphone", "filename" : "AppIcon-60@2x.png", "scale" : "2x" },
    { "size" : "60x60", "idiom" : "iphone", "filename" : "AppIcon-60@3x.png", "scale" : "3x" },
    { "size" : "20x20", "idiom" : "ipad", "filename" : "AppIcon-20.png", "scale" : "1x" },
    { "size" : "20x20", "idiom" : "ipad", "filename" : "AppIcon-20@2x.png", "scale" : "2x" },
    { "size" : "29x29", "idiom" : "ipad", "filename" : "AppIcon-29.png", "scale" : "1x" },
    { "size" : "29x29", "idiom" : "ipad", "filename" : "AppIcon-29@2x.png", "scale" : "2x" },
    { "size" : "40x40", "idiom" : "ipad", "filename" : "AppIcon-40.png", "scale" : "1x" },
    { "size" : "40x40", "idiom" : "ipad", "filename" : "AppIcon-40@2x.png", "scale" : "2x" },
    { "size" : "76x76", "idiom" : "ipad", "filename" : "AppIcon-76.png", "scale" : "1x" },
    { "size" : "76x76", "idiom" : "ipad", "filename" : "AppIcon-76@2x.png", "scale" : "2x" },
    { "size" : "83.5x83.5", "idiom" : "ipad", "filename" : "AppIcon-83.5@2x.png", "scale" : "2x" },
    { "size" : "1024x1024", "idiom" : "ios-marketing", "filename" : "AppIcon-512@2x.png", "scale" : "1x" }
  ],
  "info" : { "version" : 1, "author" : "xcode" }
}
EOF

echo ""
echo "✅ Toutes les icônes iOS ont été générées !"
echo ""
echo "📌 Étapes suivantes dans Xcode :"
echo "   1. Product → Clean Build Folder (Shift+Cmd+K)"
echo "   2. Product → Archive"
echo "   3. Upload sur App Store Connect"
echo ""
