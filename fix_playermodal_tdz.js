import fs from 'fs';

const filePath = 'E:/furina-moviebox/src/components/PlayerModal.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the premature hasWorkingHindiSource with hasInherentHindi / English / Japanese
const oldBlock1 = `  const hasWorkingHindiSource = (isCustom && playerMode === 'studio')
    ? Boolean(customSources.hi)
    : (Boolean(customSources.hi) || isBollywoodHindi || isTopVerifiedHindiTitle || isResidentEvilMovie || isMovieBoxHindi || isHindiAvailable(item) || Boolean(selectedServer?.supportsAudioSwitching || selectedServer?.badge?.includes('Multi') || selectedServer?.name?.includes('Multi') || ['nxsha', '123embed', 'autoembed', 'vidlink'].includes(selectedServer?.id)) || hindiProviderManager.hasLegitimateHindiSource(item));

  const hasWorkingEnglishSource = (isCustom && playerMode === 'studio') ? Boolean(customSources.en) : true; //
    // ? false
    // : (isCustom ? Boolean(customSources.en) : !isBollywoodHindi);

  const hasWorkingJapaneseSource = isCustom
    ? Boolean(customSources.ja)
    : (isAnime || Boolean(selectedServer?.supportsAudioSwitching || selectedServer?.badge?.includes('Multi') || selectedServer?.name?.includes('Multi')));`;

const newBlock1 = `  const hasInherentHindi = Boolean(
    customSources.hi ||
    isBollywoodHindi ||
    isTopVerifiedHindiTitle ||
    isResidentEvilMovie ||
    isMovieBoxHindi ||
    isHindiAvailable(item) ||
    hindiProviderManager.hasLegitimateHindiSource(item)
  );

  const hasInherentEnglish = (isCustom && playerMode === 'studio') ? Boolean(customSources.en) : true;
  const hasInherentJapanese = Boolean(customSources.ja || isAnime);`;

// Normalize line endings for replacement
const normalize = (str) => str.replace(/\r\n/g, '\n');
content = normalize(content);

if (content.includes(normalize(oldBlock1))) {
  content = content.replace(normalize(oldBlock1), normalize(newBlock1));
  console.log('Successfully replaced oldBlock1!');
} else {
  console.error('Could not find oldBlock1!');
  process.exit(1);
}

// 2. In getInitialAudioMode, replace hasWorkingHindiSource with hasInherentHindi, etc.
content = content.replace(/hasWorkingHindiSource/g, 'hasInherentHindi');
content = content.replace(/hasWorkingJapaneseSource/g, 'hasInherentJapanese');
content = content.replace(/hasWorkingEnglishSource/g, 'hasInherentEnglish');

// 3. Now AFTER selectedServer is declared, define the real hasWorkingHindiSource / English / Japanese!
const targetSelectedServer = `  const [selectedServer, setSelectedServer] = useState(getInitialServer);
  const [iframeLoading, setIframeLoading] = useState(true);`;

const newWorkingSources = `  const [selectedServer, setSelectedServer] = useState(getInitialServer);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Authenticated real working audio sources computed with selectedServer available
  const hasWorkingHindiSource = (isCustom && playerMode === 'studio')
    ? Boolean(customSources.hi)
    : (hasInherentHindi || Boolean(selectedServer?.supportsAudioSwitching || selectedServer?.badge?.includes('Multi') || selectedServer?.name?.includes('Multi') || ['nxsha', '123embed', 'autoembed', 'vidlink'].includes(selectedServer?.id)));

  const hasWorkingEnglishSource = hasInherentEnglish;

  const hasWorkingJapaneseSource = isCustom
    ? Boolean(customSources.ja)
    : (hasInherentJapanese || Boolean(selectedServer?.supportsAudioSwitching || selectedServer?.badge?.includes('Multi') || selectedServer?.name?.includes('Multi')));`;

if (content.includes(normalize(targetSelectedServer))) {
  content = content.replace(normalize(targetSelectedServer), normalize(newWorkingSources));
  console.log('Successfully added newWorkingSources after selectedServer!');
} else {
  console.error('Could not find targetSelectedServer!');
  process.exit(1);
}

// 4. Remove duplicate AI_BOOST_STYLES inside the component body so the module-level one is used
const duplicateAiBoost = `  const AI_BOOST_STYLES = {
    off: {},
    '4k': {
      filter: 'contrast(1.05) saturate(1.08) brightness(1.01)',
      transition: 'filter 0.3s ease'
    },
    hdr: {
      filter: 'contrast(1.12) saturate(1.18) brightness(1.02)',
      transition: 'filter 0.3s ease'
    },
    night: {
      filter: 'brightness(1.10) contrast(1.05) saturate(1.05)',
      transition: 'filter 0.3s ease'
    }
  };`;

if (content.includes(normalize(duplicateAiBoost))) {
  content = content.replace(normalize(duplicateAiBoost), '// AI_BOOST_STYLES inherited from top-level module definition');
  console.log('Successfully removed duplicate AI_BOOST_STYLES!');
} else {
  console.log('Note: duplicate AI_BOOST_STYLES was not matched (may differ in whitespace).');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Saved updated PlayerModal.jsx successfully!');
