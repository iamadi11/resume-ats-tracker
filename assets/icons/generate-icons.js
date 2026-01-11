/**
 * Generate 3D Realistic Icons
 * 
 * Creates professional 3D-style icons for the Chrome Extension
 * with gradient, shadow, and depth effects.
 */

import fs from 'fs';
import { createCanvas } from 'canvas';

/**
 * Create a 3D realistic icon
 */
function create3DIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient (blue theme matching extension)
  const bgGradient = ctx.createLinearGradient(0, 0, size, size);
  bgGradient.addColorStop(0, '#0ea5e9'); // Primary blue
  bgGradient.addColorStop(0.5, '#0284c7'); // Darker blue
  bgGradient.addColorStop(1, '#0369a1'); // Darkest blue
  
  // Fill background with gradient
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add rounded corners effect
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.15;
  // Use arcTo for rounded rectangle
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';
  
  // Create 3D document/paper effect (resume)
  const docWidth = size * 0.5;
  const docHeight = size * 0.65;
  const docX = (size - docWidth) / 2;
  const docY = size * 0.2;
  const docRadius = size * 0.05;
  
  // Document shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  const shadowX = docX + size * 0.02;
  const shadowY = docY + size * 0.02;
  ctx.moveTo(shadowX + docRadius, shadowY);
  ctx.lineTo(shadowX + docWidth - docRadius, shadowY);
  ctx.quadraticCurveTo(shadowX + docWidth, shadowY, shadowX + docWidth, shadowY + docRadius);
  ctx.lineTo(shadowX + docWidth, shadowY + docHeight - docRadius);
  ctx.quadraticCurveTo(shadowX + docWidth, shadowY + docHeight, shadowX + docWidth - docRadius, shadowY + docHeight);
  ctx.lineTo(shadowX + docRadius, shadowY + docHeight);
  ctx.quadraticCurveTo(shadowX, shadowY + docHeight, shadowX, shadowY + docHeight - docRadius);
  ctx.lineTo(shadowX, shadowY + docRadius);
  ctx.quadraticCurveTo(shadowX, shadowY, shadowX + docRadius, shadowY);
  ctx.closePath();
  ctx.fill();
  
  // Main document (white paper)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(docX + docRadius, docY);
  ctx.lineTo(docX + docWidth - docRadius, docY);
  ctx.quadraticCurveTo(docX + docWidth, docY, docX + docWidth, docY + docRadius);
  ctx.lineTo(docX + docWidth, docY + docHeight - docRadius);
  ctx.quadraticCurveTo(docX + docWidth, docY + docHeight, docX + docWidth - docRadius, docY + docHeight);
  ctx.lineTo(docX + docRadius, docY + docHeight);
  ctx.quadraticCurveTo(docX, docY + docHeight, docX, docY + docHeight - docRadius);
  ctx.lineTo(docX, docY + docRadius);
  ctx.quadraticCurveTo(docX, docY, docX + docRadius, docY);
  ctx.closePath();
  ctx.fill();
  
  // Document depth shadow (3D effect)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(docX, docY, size * 0.02, docHeight);
  
  // Document highlight (3D effect)
  const highlightGradient = ctx.createLinearGradient(docX, docY, docX + docWidth, docY);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(docX, docY, docWidth * 0.5, docHeight * 0.3);
  
  // Add text lines (simulating resume content)
  ctx.fillStyle = '#e5e7eb';
  const lineHeight = size * 0.08;
  const lineY = docY + size * 0.2;
  
  // Horizontal lines
  for (let i = 0; i < 4; i++) {
    const y = lineY + (i * lineHeight);
    const lineWidth = docWidth * (0.7 + Math.random() * 0.2);
    ctx.fillRect(docX + size * 0.1, y, lineWidth, size * 0.015);
  }
  
  // Add checkmark/score badge (ATS score indicator)
  const badgeSize = size * 0.25;
  const badgeX = docX + docWidth - badgeSize * 0.7;
  const badgeY = docY + size * 0.15;
  
  // Badge circle with gradient
  const badgeGradient = ctx.createRadialGradient(
    badgeX + badgeSize/2, badgeY + badgeSize/2,
    0, badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2
  );
  badgeGradient.addColorStop(0, '#22c55e'); // Success green
  badgeGradient.addColorStop(1, '#16a34a'); // Darker green
  
  ctx.fillStyle = badgeGradient;
  ctx.beginPath();
  ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Checkmark
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.03;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(badgeX + badgeSize * 0.25, badgeY + badgeSize * 0.5);
  ctx.lineTo(badgeX + badgeSize * 0.45, badgeY + badgeSize * 0.7);
  ctx.lineTo(badgeX + badgeSize * 0.75, badgeY + badgeSize * 0.3);
  ctx.stroke();
  
  // Add glow effect around icon (subtle)
  ctx.shadowColor = 'rgba(14, 165, 233, 0.5)';
  ctx.shadowBlur = size * 0.1;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  return canvas.toBuffer('image/png');
}

// Create icons at different sizes
console.log('🎨 Generating 3D realistic icons...\n');

try {
  const sizes = [16, 48, 128];
  
  sizes.forEach(size => {
    const icon = create3DIcon(size);
    const filename = `icon${size}.png`;
    fs.writeFileSync(filename, icon);
    console.log(`✅ Created ${filename} (${size}x${size} pixels)`);
  });
  
  console.log('\n✅ All 3D icons generated successfully!');
  console.log('📁 Location: assets/icons/');
  console.log('\n⚠️  Note: Icons will be copied to dist/ during build');
  
} catch (error) {
  console.error('❌ Error generating icons:', error.message);
  if (error.message.includes('canvas')) {
    console.log('\n💡 Installing canvas library...');
    console.log('   Run: npm install --save-dev canvas');
  }
  process.exit(1);
}
