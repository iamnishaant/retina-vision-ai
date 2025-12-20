# 3D Model Files

## Eye Anatomy Model

To use the Sketchfab Eye Anatomy model in your application:

### Option 1: Download from Sketchfab (Requires Purchase/License)

1. Visit: https://sketchfab.com/3d-models/eye-anatomy-5dac474887174eb78cb7ffce6bd9ce3a
2. Download the model in **glTF (.glb)** format from the model's download page
3. Save the file as `eye-anatomy.glb` in this directory (`public/models/`)

### Option 2: Use an Alternative Free Model

You can find free eye anatomy models on Sketchfab:
- Search for "eye anatomy" with the "Downloadable" filter
- Models with Creative Commons or free licenses
- Download in glTF (.glb) format

### Option 3: Convert Existing Model

If you have a model in another format (.obj, .fbx, .gltf):
1. Use tools like Babylon Sandbox or Three.js Editor to convert to .glb
2. Save as `eye-anatomy.glb` in this directory

### File Structure

```
public/models/
├── README.md
└── eye-anatomy.glb  (add your model here)
```

### Implementation

The Eye3D component will:
1. Try to load `eye-anatomy.glb` from the public/models folder
2. If successful, display the external model with proper lighting and controls
3. If the file doesn't exist, automatically fall back to the procedural eye anatomy model

### Current Status

- **Procedural Model**: ✅ Active (always available as fallback)
- **External Model**: ⏳ Ready to load (place .glb file in this directory)

### Notes

- The model will be automatically scaled and positioned to fit the canvas
- All interactive hover features work with either model
- The procedural model provides full functionality as a backup
