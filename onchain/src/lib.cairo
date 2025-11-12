/// Interface representing a simple Counter contract.
/// This interface allows incrementing and retrieving the counter value.
#[starknet::interface]
pub trait ICounter<TContractState> {
    /// Increment counter by 1.
    fn increment(ref self: TContractState);
    /// Retrieve current counter value.
    fn get_counter(self: @TContractState) -> u128;
}

/// Simple counter contract.
#[starknet::contract]
mod Counter {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        counter: u128,
    }

    #[abi(embed_v0)]
    impl CounterImpl of super::ICounter<ContractState> {
        fn increment(ref self: ContractState) {
            let current = self.counter.read();
            self.counter.write(current + 1);
        }

        fn get_counter(self: @ContractState) -> u128 {
            self.counter.read()
        }
    }
}
