// Define a region of interest (ROI) based on a filter applied to a table
var ROI = table.filter(ee.Filter.eq('THANA_NAME', 'Rowmari'));

// Add the ROI as a layer to the map and center the map on the ROI
Map.addLayer(ROI);
Map.centerObject(ROI);

// Create an image collection using Copernicus Sentinel-1 SAR data
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.or(
    ee.Filter.eq('orbitProperties_pass', 'DESCENDING'),
    ee.Filter.eq('orbitProperties_pass', 'ASCENDING')
  ));

// Filter the collection to select images from a specific date range and within the ROI
var after = collection.filter(ee.Filter.date('2022-05-10', '2022-05-20')).filterBounds(ROI);
var before = collection.filter(ee.Filter.date('2022-04-10', '2022-04-20')).filterBounds(ROI);

// Print the number of images in the 'after' and 'before' collections
print(after.size());
print(before.size());

// Create mosaic images for 'after' and 'before' collections, selecting the 'VH' band and clipping to the ROI
var after_image = after.select('VH').mosaic().clip(ROI);
var before_image = before.select('VH').mosaic().clip(ROI);

// Add 'before_image' and 'after_image' as layers to the map with specified visualization parameters
Map.addLayer(before_image, { min: -25, max: 0 }, 'Before');
Map.addLayer(after_image, { min: -25, max: 0 }, 'After');

// Export 'before_image' and 'after_image' to Google Drive as JPG files
var exportParamsBefore = {
  image: ee.Image(before_image),
  description: 'before_image',
  scale: 20, // Increase the scale to reduce the number of pixels
  region: ROI
};

var exportParamsAfter = {
  image: ee.Image(after_image),
  description: 'after_image',
  scale: 20, // Increase the scale to reduce the number of pixels
  region: ROI
};

// Export 'before_image' and 'after_image' to Google Drive
Export.image.toDrive(exportParamsBefore);
Export.image.toDrive(exportParamsAfter);

// Log a message to indicate that image export to Google Drive is in progress
console.log('Exporting images to Google Drive');
