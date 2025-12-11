// frontend/app/dashboard/hr/jobs/test-api.tsx
'use client';

import { useEffect } from 'react';

export default function TestApi() {
  useEffect(() => {
    const testEndpoints = async () => {
      console.log('Testing API endpoints...');
      
      // Test 1: Check if endpoint exists
      try {
        const response = await fetch('/api/jobs');
        console.log('Jobs endpoint status:', response.status);
        console.log('Jobs endpoint headers:', response.headers);
        const data = await response.json();
        console.log('Jobs endpoint data:', data);
      } catch (error) {
        console.error('Jobs endpoint error:', error);
      }
      
      // Test 2: Check if backend is running
      try {
        const response = await fetch('http://localhost:3001/api/jobs'); // Adjust port
        console.log('Direct backend status:', response.status);
      } catch (error) {
        console.error('Backend not reachable:', error);
      }
    };
    
    testEndpoints();
  }, []);

  return <div>Check console for API test results</div>;
}