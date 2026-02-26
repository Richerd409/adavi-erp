import { describe, it, expect } from 'vitest';

// Define types locally since we can't easily import from supabase types in a standalone test without proper setup
type OrderStatus = 'New' | 'In Progress' | 'Trial' | 'Alteration' | 'Completed' | 'Delivered' | 'Cancelled';

const getNextStatuses = (current: OrderStatus): OrderStatus[] => {
    const flow: OrderStatus[] = ['New', 'In Progress', 'Trial', 'Alteration', 'Completed', 'Delivered'];
    const index = flow.indexOf(current);
    if (index === -1 || index === flow.length - 1) return [];

    // Special case: Trial can go to Alteration OR Completed
    if (current === 'Trial') {
      return ['Alteration', 'Completed'];
    }

    return [flow[index + 1]];
};

describe('Order State Machine Logic', () => {
  it('should transition from New to In Progress', () => {
    expect(getNextStatuses('New')).toEqual(['In Progress']);
  });

  it('should transition from In Progress to Trial', () => {
    expect(getNextStatuses('In Progress')).toEqual(['Trial']);
  });

  it('should allow branching from Trial to Alteration OR Completed', () => {
    expect(getNextStatuses('Trial')).toEqual(['Alteration', 'Completed']);
  });

  it('should transition from Alteration to Completed', () => {
    expect(getNextStatuses('Alteration')).toEqual(['Completed']);
  });

  it('should transition from Completed to Delivered', () => {
    expect(getNextStatuses('Completed')).toEqual(['Delivered']);
  });

  it('should have no next status after Delivered', () => {
    expect(getNextStatuses('Delivered')).toEqual([]);
  });

  it('should return empty array for invalid status', () => {
    // @ts-expect-error Testing invalid input
    expect(getNextStatuses('InvalidStatus')).toEqual([]);
  });
});
