const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing Algorithm Explanation API...');
    
    const response = await fetch('http://localhost:3000/api/gemini/explain-algorithm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        algorithmName: 'Binary Search',
        problemType: 'Search Algorithm',
        context: 'Finding elements in sorted arrays'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const data = await response.text();
    console.log('Response body (first 500 chars):', data.substring(0, 500));
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      console.log('JSON parsed successfully:', {
        success: jsonData.success,
        hasData: !!jsonData.data,
        dataLength: jsonData.data ? jsonData.data.length : 0
      });
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      console.log('Raw response:', data);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();
