const fs = require('fs');
const path = require('path');

const files = [
  'src/components/LocationPermissionScreen.tsx',
  'src/components/MobileDeviceShell.tsx',
  'src/components/VendorLoginModal.tsx',
  'src/components/MenuStockManagementScreen.tsx',
  'src/components/BusinessDashboardScreen.tsx',
  'src/components/AddEditFoodItemScreen.tsx',
  'src/components/SplashOnboardingScreen.tsx',
  'src/components/InstallPrompt.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/App.tsx',
  'src/lib/celebration.ts'
];

for (const rel of files) {
  const file = path.resolve(rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');

  // Logo replacement
  text = text.replaceAll('/images/logo.png', '/images/NewLogo.svg');
  text = text.replaceAll('/images/brand_logo_full.png', '/images/NewLogo.svg');
  text = text.replaceAll('/images/mascot.png', '/images/NewLogo.svg');

  // Brand green replacements with exact #FE7200 and complementary warm tones
  text = text.replaceAll('#0A461E', '#FE7200');
  text = text.replaceAll('#09431B', '#FE7200');
  text = text.replaceAll('#063214', '#E05D00');
  text = text.replaceAll('#073515', '#E05D00');
  text = text.replaceAll('#062814', '#FE7200');
  text = text.replaceAll('#0A2E20', '#1F140A');
  text = text.replaceAll('#5C7A6D', '#7A6658');
  text = text.replaceAll('#527063', '#7A6658');
  text = text.replaceAll('btn-green-shadow', 'btn-orange-shadow');

  // Specific device frame / chassis / overlay dark greens
  text = text.replaceAll('#25392E', '#241A14');
  text = text.replaceAll('#192720', '#18120E');
  text = text.replaceAll('#121E18', '#100B08');
  text = text.replaceAll('#2D4537', '#2A1C14');
  text = text.replaceAll('#0C381E', '#FE7200');
  text = text.replaceAll('#105C2E', '#E05D00');
  text = text.replaceAll('#0A3D1C', '#C44E00');
  text = text.replaceAll('#032A15', '#241204');
  text = text.replaceAll('#080D0A', '#120A03');

  if (rel.includes('celebration.ts')) {
    text = text.replaceAll(
      "['#00B574', '#10B981', '#34D399', '#FBBF24', '#09431B']",
      "['#FE7200', '#FF8A2A', '#FFA500', '#FBBF24', '#E05D00']"
    );
  }

  fs.writeFileSync(file, text, 'utf8');
  console.log(`Updated ${rel}`);
}
