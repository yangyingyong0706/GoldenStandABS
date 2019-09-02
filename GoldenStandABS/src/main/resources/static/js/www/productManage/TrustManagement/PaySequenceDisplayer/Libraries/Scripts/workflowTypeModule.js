var workflowType = {
    '001': {
        workflowDisplayName: '贵州股权金融资产交易中心《项目》审批流程',
        controlTaskCode: 'TrustGroupMonitorControl',
        monitorTaskCode: 'TrustGroupMonitor',
        controlAppDomain: 'Monitor',
        monitorAppDomain: 'Monitor',
        sourceTaskAppDomain: 'Task',
        sessionVariable: [  ['TrustGroup.BussinessDistribute_CurrentState', 'Pending InputData'],
                            ['TrustGroup.BussinessApproval_CurrentState', 'Pending BPSApproval'],
                            ['TrustGroup.LeaderApproval_CurrentState', 'Pending DGMApproval']
                         ]
    },
    '002': {
        workflowDisplayName: '贵州股权金融资产交易中心《产品》审批流程',
        controlTaskCode: 'TrustMonitorControl',
        monitorTaskCode: 'TrustMonitor',
        controlAppDomain: 'Monitor',
        monitorAppDomain: 'Monitor',
        sourceTaskAppDomain: 'Task',
        sessionVariable: [['Trust.TurstDistribute_CurrentState', 'Pending TrustDataInput'],
                            ['Trust.TrustApproval_CurrentState', 'Pending TrustManagerApproval'],
                            ['Trust.TransferInstructionDistribute_CurrentState', 'Pending TrustManagerDistribute'],
                            ['Trust.TransferInstructionApproval_CurrentState', 'Pending TrustTransferInstructionTradingApproval'],
                            ['Trust.TrustFounded_CurrentState', 'Pending TrustTransferInstructionRun']
        ]
    },
    '003': {
        workflowDisplayName: '贵州股权金融资产交易中心《开户》审批流程',
        controlTaskCode: 'TrustAccountMonitorControl',
        monitorTaskCode: 'TrustAccountMonitor',
        controlAppDomain: 'Monitor',
        monitorAppDomain: 'Monitor',
        sourceTaskAppDomain: 'Task',
        sessionVariable: [['TrustAccount.BussinessApproval_CurrentState', 'Pending TrustAccountDataInput']
        ]
    }
}