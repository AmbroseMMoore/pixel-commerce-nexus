
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: any;
  timing?: number;
}

interface TestResults {
  connection?: TestResult;
  session?: TestResult;
  customers?: TestResult;
  orders?: TestResult;
  profile?: TestResult;
}

const AdminDataTest = () => {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults({});
    const results: TestResults = {};

    try {
      console.log('🧪 Starting Admin Data Connection Tests');

      // Test 1: Basic Supabase connection
      console.log('Test 1: Basic connection...');
      const connectionStart = Date.now();
      try {
        const { data, error, count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        results.connection = { 
          success: !error, 
          data: { count }, 
          error: error,
          timing: Date.now() - connectionStart
        };
        console.log('✅ Connection test passed:', { count });
      } catch (error) {
        results.connection = { 
          success: false, 
          error,
          timing: Date.now() - connectionStart
        };
        console.log('❌ Connection test failed:', error);
      }

      // Test 2: Auth session
      console.log('Test 2: Auth session...');
      const sessionStart = Date.now();
      try {
        const { data: session, error } = await supabase.auth.getSession();
        results.session = { 
          success: !error && !!session.session, 
          data: {
            hasSession: !!session.session,
            userEmail: session.session?.user?.email,
            userId: session.session?.user?.id
          },
          error: error,
          timing: Date.now() - sessionStart
        };
        console.log('✅ Session test passed');
      } catch (error) {
        results.session = { 
          success: false, 
          error,
          timing: Date.now() - sessionStart
        };
        console.log('❌ Session test failed:', error);
      }

      // Test 3: Customers data
      console.log('Test 3: Customers data...');
      const customersStart = Date.now();
      try {
        const { data, error, count } = await supabase
          .from('customers')
          .select('id, name, email, created_at', { count: 'exact' })
          .limit(3);
        
        results.customers = { 
          success: !error, 
          data: { count, sampleData: data }, 
          error: error,
          timing: Date.now() - customersStart
        };
        console.log('✅ Customers test passed:', { count });
      } catch (error) {
        results.customers = { 
          success: false, 
          error,
          timing: Date.now() - customersStart
        };
        console.log('❌ Customers test failed:', error);
      }

      // Test 4: Orders data
      console.log('Test 4: Orders data...');
      const ordersStart = Date.now();
      try {
        const { data, error, count } = await supabase
          .from('orders')
          .select('id, order_number, status, total_amount, created_at', { count: 'exact' })
          .limit(3);
        
        results.orders = { 
          success: !error, 
          data: { count, sampleData: data }, 
          error: error,
          timing: Date.now() - ordersStart
        };
        console.log('✅ Orders test passed:', { count });
      } catch (error) {
        results.orders = { 
          success: false, 
          error,
          timing: Date.now() - ordersStart
        };
        console.log('❌ Orders test failed:', error);
      }

      // Test 5: Profile check
      console.log('Test 5: Profile check...');
      const profileStart = Date.now();
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .eq('id', session.session.user.id)
            .single();
          
          results.profile = { 
            success: !error && !!data, 
            data: data, 
            error: error,
            timing: Date.now() - profileStart
          };
          console.log('✅ Profile test passed');
        } else {
          results.profile = { 
            success: false, 
            error: 'No user session',
            timing: Date.now() - profileStart
          };
        }
      } catch (error) {
        results.profile = { 
          success: false, 
          error,
          timing: Date.now() - profileStart
        };
        console.log('❌ Profile test failed:', error);
      }

    } catch (globalError) {
      console.error('❌ Global test error:', globalError);
    }

    setTestResults(results);
    setIsLoading(false);
    console.log('🧪 Test Results:', results);
  };

  const getStatusIcon = (result?: TestResult) => {
    if (!result) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    return result.success 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (result?: TestResult) => {
    if (!result) return <Badge variant="secondary">Not Run</Badge>;
    return result.success 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>
      : <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Admin Database Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Diagnostic Tests'
          )}
        </Button>
        
        {Object.keys(testResults).length > 0 && (
          <div className="grid gap-4">
            <h3 className="font-semibold text-lg">Test Results:</h3>
            
            {Object.entries({
              connection: 'Database Connection',
              session: 'Authentication Session',
              customers: 'Customers Data Access',
              orders: 'Orders Data Access',
              profile: 'User Profile Access'
            }).map(([key, label]) => {
              const result = testResults[key as keyof TestResults];
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result)}
                    <span className="font-medium">{label}</span>
                    {result?.timing && (
                      <span className="text-sm text-gray-500">({result.timing}ms)</span>
                    )}
                  </div>
                  {getStatusBadge(result)}
                </div>
              );
            })}
            
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm text-gray-600 hover:text-gray-800">
                View Detailed Results
              </summary>
              <pre className="bg-gray-50 p-4 rounded mt-2 text-xs overflow-auto max-h-64">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDataTest;
