const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/App.tsx',
  'src/components/AddEditFoodItemScreen.tsx',
  'src/components/FeedbackModal.tsx',
  'src/components/FoodItemDetailScreen.tsx',
  'src/components/HomeDiscoveryScreen.tsx',
  'src/components/LocationPermissionScreen.tsx',
  'src/components/QuickOrderModal.tsx',
  'src/components/SplashOnboardingScreen.tsx',
  'src/components/WalkInMapModal.tsx',
  'src/components/BusinessDashboardScreen.tsx',
  'src/components/MenuStockManagementScreen.tsx'
];

for (const rel of targetFiles) {
  const file = path.resolve(rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');

  // Replace sage/mint borders & chips with clean neumorphic and warm orange equivalents
  text = text.replaceAll('#073515', '#E05D00');
  text = text.replaceAll('#A7F3D0', '#FFEAD9');
  text = text.replaceAll('#BAC8C0', '#D6DCE2');
  text = text.replaceAll('#CAD8D0', '#D6DCE2');
  text = text.replaceAll('#EFF5EF', '#E8ECEF');
  text = text.replaceAll('#E5EDE9', '#E8ECEF');
  text = text.replaceAll('#C0D0BD', '#D6DCE2');
  text = text.replaceAll('#BACBC1', '#D6DCE2');
  text = text.replaceAll('#C8D8CE', '#D6DCE2');
  text = text.replaceAll('#DDE8E1', '#E8ECEF');
  text = text.replaceAll('#062E16', '#1F140A');

  fs.writeFileSync(file, text, 'utf8');
  console.log(`Cleaned tints in ${rel}`);
}
