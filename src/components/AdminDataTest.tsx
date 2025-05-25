
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDataTest = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      console.log('=== Running Admin Data Tests ===');

      // Test 1: Basic Supabase connection
      console.log('Test 1: Basic connection...');
      try {
        const { data, error } = await supabase.from('customers').select('id').limit(1);
        results.connection = { success: true, data, error: null };
        console.log('✅ Connection test passed');
      } catch (error) {
        results.connection = { success: false, error };
        console.log('❌ Connection test failed:', error);
      }

      // Test 2: Auth session
      console.log('Test 2: Auth session...');
      try {
        const { data: session, error } = await supabase.auth.getSession();
        results.session = { 
          success: true, 
          hasSession: !!session.session,
          userEmail: session.session?.user?.email,
          error: null 
        };
        console.log('✅ Session test passed');
      } catch (error) {
        results.session = { success: false, error };
        console.log('❌ Session test failed:', error);
      }

      // Test 3: Customers data with proper query
      console.log('Test 3: Customers data...');
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, email, created_at')
          .limit(5);
        results.customers = { success: true, count: data?.length || 0, data, error: null };
        console.log('✅ Customers test passed');
      } catch (error) {
        results.customers = { success: false, error };
        console.log('❌ Customers test failed:', error);
      }

      // Test 4: Orders data with proper query
      console.log('Test 4: Orders data...');
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_number, total_amount, status, created_at')
          .limit(5);
        results.orders = { success: true, count: data?.length || 0, data, error: null };
        console.log('✅ Orders test passed');
      } catch (error) {
        results.orders = { success: false, error };
        console.log('❌ Orders test failed:', error);
      }

      // Test 5: Profile check
      console.log('Test 5: Profile check...');
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.session.user.id)
            .single();
          results.profile = { success: true, data, error: null };
          console.log('✅ Profile test passed');
        } else {
          results.profile = { success: false, error: 'No user session' };
        }
      } catch (error) {
        results.profile = { success: false, error };
        console.log('❌ Profile test failed:', error);
      }

    } catch (globalError) {
      console.error('❌ Global test error:', globalError);
      results.global = { success: false, error: globalError };
    }

    setTestResults(results);
    setIsLoading(false);
    console.log('=== Test Results ===', results);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Data Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? 'Running Tests...' : 'Run Connection Tests'}
        </Button>
        
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDataTest;
