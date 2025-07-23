#!/usr/bin/env python3
"""
Quick script to create placeholder icons for FocusGuard Chrome extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple FG icon with specified size"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), '#1E40AF')  # Blue background
    draw = ImageDraw.Draw(img)
    
    # Add white border
    border_width = max(1, size // 16)
    draw.rectangle([border_width, border_width, size-border_width, size-border_width], 
                   outline='white', width=border_width)
    
    # Add "FG" text
    try:
        # Try to use a system font
        font_size = max(8, size // 3)
        font = ImageFont.truetype("/System/Library/Fonts/Arial Bold.ttf", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    # Get text dimensions and center it
    bbox = draw.textbbox((0, 0), "FG", font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw the text
    draw.text((x, y), "FG", fill='white', font=font)
    
    # Save the image
    img.save(filename)
    print(f"Created {filename} ({size}x{size})")

if __name__ == "__main__":
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Create required icon sizes
    sizes = [
        (16, 'icons/icon16.png'),
        (48, 'icons/icon48.png'),
        (128, 'icons/icon128.png')
    ]
    
    for size, filename in sizes:
        create_icon(size, filename)
    
    print("\nPlaceholder icons created successfully!")
    print("You can replace these with professional icons later.")
