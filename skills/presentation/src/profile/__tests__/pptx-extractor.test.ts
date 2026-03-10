import { describe, it, expect } from 'vitest';
import { parseThemeXml } from '../pptx-extractor.js';

// Test the XML parsing logic directly (no PPTX file needed)
const sampleThemeXml = `<?xml version="1.0" encoding="UTF-8"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="TestScheme">
      <a:dk1><a:srgbClr val="1A1A2E"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="16213E"/></a:dk2>
      <a:lt2><a:srgbClr val="E8E8E8"/></a:lt2>
      <a:accent1><a:srgbClr val="0F3460"/></a:accent1>
      <a:accent2><a:srgbClr val="533483"/></a:accent2>
    </a:clrScheme>
    <a:fontScheme name="TestFonts">
      <a:majorFont><a:latin typeface="Archivo Black"/></a:majorFont>
      <a:minorFont><a:latin typeface="Inter"/></a:minorFont>
    </a:fontScheme>
  </a:themeElements>
</a:theme>`;

describe('parseThemeXml', () => {
  it('should extract background color from dk1', () => {
    const result = parseThemeXml(sampleThemeXml);
    expect(result.bgColor).toBe('#1A1A2E');
  });

  it('should extract text color from lt1', () => {
    const result = parseThemeXml(sampleThemeXml);
    expect(result.textColor).toBe('#FFFFFF');
  });

  it('should extract accent color from accent1', () => {
    const result = parseThemeXml(sampleThemeXml);
    expect(result.accentColor).toBe('#0F3460');
  });

  it('should extract display font from majorFont', () => {
    const result = parseThemeXml(sampleThemeXml);
    expect(result.displayFont).toBe('Archivo Black');
  });

  it('should extract body font from minorFont', () => {
    const result = parseThemeXml(sampleThemeXml);
    expect(result.bodyFont).toBe('Inter');
  });

  it('should handle system theme colors (sysClr)', () => {
    const xml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
      <a:themeElements>
        <a:clrScheme name="sys">
          <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
          <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
          <a:dk2><a:srgbClr val="333333"/></a:dk2>
          <a:lt2><a:srgbClr val="EEEEEE"/></a:lt2>
          <a:accent1><a:srgbClr val="4472C4"/></a:accent1>
        </a:clrScheme>
        <a:fontScheme name="f">
          <a:majorFont><a:latin typeface="Calibri"/></a:majorFont>
          <a:minorFont><a:latin typeface="Calibri"/></a:minorFont>
        </a:fontScheme>
      </a:themeElements>
    </a:theme>`;
    const result = parseThemeXml(xml);
    expect(result.bgColor).toBe('#000000');
    expect(result.textColor).toBe('#FFFFFF');
  });

  it('should return empty object for empty/invalid XML', () => {
    const result = parseThemeXml('');
    expect(result.bgColor).toBeUndefined();
    expect(result.displayFont).toBeUndefined();
  });
});
