const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/pages/quick-edit/components/TimelineHub.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\{Array\.from\(\{\s*length:\s*numFrames\s*\}\)\.map\(\(_, fi\) => \([\s\S]+?\)\)\}/;

const replacementSegment = `{Array.from({ length: numFrames }).map((_, fi) => {
                                      const frameTime = Math.min(trim.end, Math.max(trim.start, trim.start + fi * (effDur / numFrames)));
                                      return (
                                        <div
                                          key={fi}
                                          className="shrink-0 relative overflow-hidden"
                                          style={{ width: frameW, height: clipH - 35 }}
                                        >
                                          {clip.preview ? (
                                            <video
                                              src={\`\${clip.preview}#t=\${frameTime}\`}
                                              muted
                                              preload="metadata"
                                              onLoadedMetadata={(e) => {
                                                e.currentTarget.currentTime = frameTime;
                                              }}
                                              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                            />
                                          ) : (
                                            <div
                                              className="absolute inset-0"
                                              style={{
                                                background: \`linear-gradient(135deg, hsl(\$\{(fi * 33) % 360\}, 45%, 15%) 0%, hsl(\$\{(fi * 33 + 45) % 360\}, 45%, 10%) 100%)\`
                                              }}
                                            />
                                          )}
                                          {fi > 0 && <div className="absolute inset-y-0 left-0 w-px bg-white/10 pointer-events-none" />}
                                        </div>
                                      );
                                    })}`;

if (regex.test(content)) {
    const updatedContent = content.replace(regex, replacementSegment);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Successfully updated filmstrip thumbnails in TimelineHub.tsx');
} else {
    console.error('Regex target not found in TimelineHub.tsx');
}
