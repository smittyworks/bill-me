import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { api } from '../lib/api';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import { Bill } from '../../shared/types';

export default function BillsListScreen({ navigation }: any) {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = async () => {
    try {
      const token = await getToken();
      api.setToken(token);

      const response = await api.getBills();
      setBills(response.bills);
    } catch (error: any) {
      console.error('Error loading bills:', error);
      Alert.alert('Error', error.message || 'Failed to load bills');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBills();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        console.log('Push token:', pushToken);

        // Register token with backend
        const authToken = await getToken();
        api.setToken(authToken);
        await api.registerPushToken({ token: pushToken });
        console.log('Push token registered with backend');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBills();
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const renderBillItem = ({ item }: { item: Bill }) => {
    const daysUntil = getDaysUntilDue(item.due_date);
    const isOverdue = daysUntil.includes('overdue');
    const isPaid = item.status === 'paid';

    return (
      <TouchableOpacity
        style={styles.billItem}
        onPress={() => {
          // TODO: Navigate to bill detail
          Alert.alert(
            'Bill Details',
            `Balance: ${formatAmount(item.balance)}\nMinimum Due: ${formatAmount(item.minimum_due)}\nDue: ${formatDate(item.due_date)}`
          );
        }}
      >
        <View style={styles.billHeader}>
          <Text style={styles.billDescription}>
            {item.description || 'Untitled Bill'}
          </Text>
          <View style={styles.billAmounts}>
            <Text style={styles.billAmount}>{formatAmount(item.balance)}</Text>
            <Text style={styles.billMinimum}>Min: {formatAmount(item.minimum_due)}</Text>
          </View>
        </View>

        <View style={styles.billFooter}>
          <Text style={[
            styles.billDue,
            isOverdue && !isPaid && styles.billOverdue,
            isPaid && styles.billPaid,
          ]}>
            {isPaid ? 'Paid' : daysUntil}
          </Text>
          <Text style={styles.billDate}>{formatDate(item.due_date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Bills</Text>
          <Text style={styles.headerSubtitle}>
            {user?.emailAddresses[0]?.emailAddress}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutButton}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {bills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the + button to add your first bill
          </Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderBillItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  signOutButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  billItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billDescription: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  billAmounts: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  billMinimum: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDue: {
    fontSize: 14,
    color: '#666',
  },
  billOverdue: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  billPaid: {
    color: '#34C759',
    fontWeight: '600',
  },
  billDate: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
  },
});
