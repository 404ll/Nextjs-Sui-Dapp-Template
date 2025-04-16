'use client'

import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useState } from 'react'

/*这个 Hook 是对 Sui 区块链交易的封装，基于 `@mysten/dapp-kit` 提供的 [useSignAndExecuteTransaction](http://_vscodecontentref_/1) 实现。它的主要功能是：
1. **签名并执行交易**：通过 [useSignAndExecuteTransaction](http://_vscodecontentref_/2) 调用 Sui 区块链的交易。
2. **状态管理**：提供 [isLoading](http://_vscodecontentref_/3) 状态，指示交易是否正在进行。
3. **回调支持**：支持 [onSuccess](http://_vscodecontentref_/4)、[onError](http://_vscodecontentref_/5) 和 [onSettled](http://_vscodecontentref_/6) 回调，用于处理交易的不同状态。
*/

export type BetterSignAndExecuteTransactionProps<TArgs extends unknown[] = unknown[]> = {
    tx: (...args: TArgs) => Transaction // 交易生成函数
    onSuccess?: () => void              // 成功回调
    onError?: (error: Error) => void    // 错误回调
    onSettled?: () => void              // 交易完成回调（无论成功或失败）
}

//hook定义
export function useBetterSignAndExecuteTransaction<TArgs extends unknown[] = unknown[]>(props: BetterSignAndExecuteTransactionProps<TArgs>) {
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const [isLoading, setIsLoading] = useState(false)

    const handleSignAndExecuteTransaction = async (...args: TArgs) => {
        const tx = props.tx(...args) // 调用传入的交易生成函数，生成交易对象
        setIsLoading(true)          // 设置加载状态为 true
        await signAndExecuteTransaction({ transaction: tx }, {
            onSuccess: async () => {
                await props.onSuccess?.() // 调用成功回调（如果存在）
            },
            onError: (error) => {
                props.onError?.(error)   // 调用错误回调（如果存在）
                setIsLoading(false)     // 设置加载状态为 false
            },
            onSettled: () => {
                props.onSettled?.()     // 调用完成回调（如果存在）
                setIsLoading(false)     // 设置加载状态为 false
            }
        })
    }

    return { handleSignAndExecuteTransaction, isLoading }
}

