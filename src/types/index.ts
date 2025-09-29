export type Status = 'REJECTED' | 'PENDING' | 'CALL' | 'RESUBMITTED';

export type CoverageType = 'Primary' | 'Secondary';

export type ClaimRow = {
	id: string;
	patientName: string;
	patientId: string;
	serviceDate: string;     // ISO
	insuranceCarrier: string;
	coverageType: CoverageType;
	amountCents: number;
	status: Status;
	lastUpdated: string;     // ISO
	userInitials: string;
	dateSent: string;
	dateSentOrig: string;
	pmsSyncStatus: 'Synced' | 'Not synced';
	pmsSyncStatusDetail: string;
	provider: string;
	providerId: string;
};
