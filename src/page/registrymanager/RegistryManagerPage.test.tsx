/**
 * Test file for RegistryManagerPage
 * This demonstrates how to use the Registry Manager functionality
 */

import { RegistryService } from '../../service/RegistryService';

// Example usage of RegistryService
console.log('=== Registry Manager Test ===');

// 1. Add registries
console.log('\n1. Adding registries...');
const registry1 = RegistryService.add('https://example.com/registry1.json');
const registry2 = RegistryService.add('https://example.com/registry2.json');
const registry3 = RegistryService.add('https://example.com/registry3.json');

console.log('Added registry 1:', registry1);
console.log('Added registry 2:', registry2);
console.log('Added registry 3:', registry3);

// 2. Get all registries
console.log('\n2. Getting all registries...');
const allRegistries = RegistryService.getAll();
console.log('Total registries:', allRegistries.length);
console.log('All registries:', allRegistries);

// 3. Get registry by ID
if (registry1) {
  console.log('\n3. Getting registry by ID...');
  const foundRegistry = RegistryService.getById(registry1.id);
  console.log('Found registry:', foundRegistry);
}

// 4. Update a registry
if (registry2) {
  console.log('\n4. Updating registry...');
  const updatedRegistry = RegistryService.update(registry2.id, 'https://example.com/updated-registry.json');
  console.log('Updated registry:', updatedRegistry);
}

// 5. Try to add duplicate (should fail)
console.log('\n5. Trying to add duplicate URL...');
const duplicate = RegistryService.add('https://example.com/registry1.json');
console.log('Duplicate result (should be null):', duplicate);

// 6. Try to add invalid URL (should fail)
console.log('\n6. Trying to add invalid URL...');
const invalid = RegistryService.add('not-a-valid-url');
console.log('Invalid URL result (should be null):', invalid);

// 7. Delete a registry
if (registry3) {
  console.log('\n7. Deleting registry...');
  const deleteResult = RegistryService.delete(registry3.id);
  console.log('Delete result:', deleteResult);
  console.log('Remaining registries:', RegistryService.getAll().length);
}

// 8. Final state
console.log('\n8. Final state...');
console.log('Final registries:', RegistryService.getAll());

console.log('\n=== Test Complete ===');

