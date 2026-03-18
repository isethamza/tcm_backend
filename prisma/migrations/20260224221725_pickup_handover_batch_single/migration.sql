-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('DELIVERY', 'PAYMENT', 'KYC', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'TRANSPORTEUR', 'HUB_MANAGER', 'RECIPIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CREATED', 'PREPAID', 'AWAITING_PICKUP', 'AWAITING_DROPOFF', 'IN_PICKUP', 'PICKED_UP', 'AT_ORIGIN_HUB', 'IN_TRANSIT', 'AT_DESTINATION_HUB', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'PICKUP_PENDING', 'AT_HUB');

-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('NOT_SCHEDULED', 'ROUTED', 'PROPOSED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'RETURNED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CLIENT_PAYMENT', 'PLATFORM_COMMISSION', 'VAT', 'TRANSPORTEUR_PAYOUT', 'HUB_PAYOUT', 'REFUND', 'INSURANCE_PREMIUM', 'INSURANCE_PAYOUT');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KycType" AS ENUM ('CLIENT', 'TRANSPORTEUR', 'HUB_MANAGER', 'RECEIVER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('KYC_APPROVED', 'KYC_REJECTED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED', 'CASH_CONFIRMED', 'PAYOUT_TRIGGERED', 'USER_SUSPENDED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ON_HOLD', 'PREPONED', 'DELAYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PickupSessionStatus" AS ENUM ('STARTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VerificationArtifactType" AS ENUM ('IDENTITY', 'PARCEL', 'SIGNATURE');

-- CreateEnum
CREATE TYPE "TrackingEventType" AS ENUM ('PUBLIC', 'INTERNAL');

-- CreateEnum
CREATE TYPE "HubType" AS ENUM ('MAIN', 'TRANSIT', 'FIRST_LAST_MILE');

-- CreateEnum
CREATE TYPE "HubStatus" AS ENUM ('DRAFT', 'PENDING_KYC', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PickupOption" AS ENUM ('STANDARD_HOME_PICKUP', 'ADVANCED_HOME_PICKUP', 'SELF_DROPOFF_AT_HUB', 'SELF_DROPOFF_AT_TRANSPORTEUR');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "DeliveryOption" AS ENUM ('HOME_DELIVERY', 'HUB_PICKUP', 'POPUP_PICKUP');

-- CreateEnum
CREATE TYPE "TripStopType" AS ENUM ('PICKUP', 'DELIVERY', 'BOTH');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('OFFERED', 'ACTIVE', 'CLAIMED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InsuranceClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "SlotProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('CREATED', 'VERIFIED', 'PICKED_UP', 'MISSING', 'DAMAGED');

-- CreateEnum
CREATE TYPE "HandoverDestinationType" AS ENUM ('CITY', 'HUB', 'TRIP_STOP');

-- CreateEnum
CREATE TYPE "HandoverBatchStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "cashAllowed" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "phone" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "companyRegistrationId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipients" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "lengthCm" DOUBLE PRECISION NOT NULL,
    "widthCm" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "estimatedValue" DOUBLE PRECISION,
    "verifiedWeightKg" DOUBLE PRECISION,
    "verifiedLengthCm" DOUBLE PRECISION,
    "verifiedWidthCm" DOUBLE PRECISION,
    "verifiedHeightCm" DOUBLE PRECISION,
    "verifiedAt" TIMESTAMP(3),
    "volumetricWeightKg" DOUBLE PRECISION,
    "chargeableWeightKg" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION,
    "status" "ParcelStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientSnapshot" JSONB NOT NULL,
    "pickupOption" "PickupOption" NOT NULL,
    "deliveryOption" "DeliveryOption" NOT NULL,
    "deliveryPrice" DOUBLE PRECISION NOT NULL,
    "pickupFee" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL,
    "hubFee" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "prepaidAmount" DECIMAL(65,30) NOT NULL,
    "remainingAmount" DECIMAL(65,30) NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "pickupStatus" "PickupStatus" NOT NULL,
    "totalWeightKg" DOUBLE PRECISION,
    "originHubId" TEXT,
    "destinationHubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pickupLat" DOUBLE PRECISION NOT NULL,
    "pickupLng" DOUBLE PRECISION NOT NULL,
    "routeOrder" INTEGER,
    "estimatedArrival" TIMESTAMP(3),
    "pickupStart" TIMESTAMP(3),
    "pickupEnd" TIMESTAMP(3),
    "pickupLocked" BOOLEAN NOT NULL DEFAULT false,
    "pickupLockedAt" TIMESTAMP(3),
    "dropoffTripStopId" TEXT,
    "deliveryTripStopId" TEXT,
    "hasIssues" BOOLEAN NOT NULL DEFAULT false,
    "issuesCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingIssue" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "parcelId" TEXT,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomsItem" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "hsCode" TEXT,

    CONSTRAINT "CustomsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_slots" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "bookingCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduling_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduling_proposals" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "SlotProposalStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduling_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "eta" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_sessions" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "pickupOption" "PickupOption" NOT NULL,
    "handledById" TEXT,
    "handledByRole" "UserRole",
    "locationName" TEXT,
    "locationCity" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "finalWeightKg" DOUBLE PRECISION,
    "finalLengthCm" DOUBLE PRECISION,
    "finalWidthCm" DOUBLE PRECISION,
    "finalHeightCm" DOUBLE PRECISION,
    "cashCollected" DOUBLE PRECISION,
    "status" "PickupSessionStatus" NOT NULL DEFAULT 'STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverEvent" (
    "id" TEXT NOT NULL,
    "batchId" TEXT,
    "parcelId" TEXT,
    "bookingId" TEXT,
    "fromType" "UserRole" NOT NULL,
    "fromUserId" TEXT,
    "toType" "UserRole" NOT NULL,
    "toUserId" TEXT,
    "fromHubId" TEXT,
    "toHubId" TEXT,
    "locationName" TEXT,
    "locationCity" TEXT,
    "declaredStatus" "ParcelStatus",
    "notes" TEXT,
    "photos" TEXT[],
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "handedOverAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "handedById" TEXT NOT NULL,
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandoverEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverBatch" (
    "id" TEXT NOT NULL,
    "transporteurId" TEXT NOT NULL,
    "destinationType" "HandoverDestinationType" NOT NULL,
    "hubId" TEXT,
    "tripStopId" TEXT,
    "destinationCity" TEXT,
    "tripId" TEXT,
    "status" "HandoverBatchStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HandoverBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverBatchParcel" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,

    CONSTRAINT "HandoverBatchParcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "batchId" TEXT,
    "parcelId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandoverToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_artifacts" (
    "id" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "type" "VerificationArtifactType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "transporteurId" TEXT NOT NULL,
    "departureCountry" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "arrivalCountry" TEXT NOT NULL,
    "arrivalCity" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "previousDepartureDate" TIMESTAMP(3),
    "previousArrivalDate" TIMESTAMP(3),
    "capacityKg" DOUBLE PRECISION NOT NULL,
    "capacityM3" DOUBLE PRECISION NOT NULL,
    "pickupAddonFee" DOUBLE PRECISION,
    "deliveryAddonFee" DOUBLE PRECISION,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPricingRule" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "minKg" INTEGER NOT NULL,
    "maxKg" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TripPricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "parcelId" TEXT,
    "tripId" TEXT,
    "status" "TrackingStatus" NOT NULL,
    "eventType" "TrackingEventType" NOT NULL DEFAULT 'PUBLIC',
    "message" TEXT,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "collectedBy" "UserRole",
    "status" "PaymentStatus" NOT NULL,
    "stripeIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "inssuranceAmount" DOUBLE PRECISION,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transporteurId" TEXT,
    "hubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "verifierId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "type" "DisputeType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kyc" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "KycType" NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "idDocumentUrl" TEXT,
    "selfieUrl" TEXT,
    "licenseUrl" TEXT,
    "insuranceUrl" TEXT,
    "verifierId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT,
    "type" "HubType" NOT NULL DEFAULT 'FIRST_LAST_MILE',
    "status" "HubStatus" NOT NULL DEFAULT 'DRAFT',
    "maxParcelWeightKg" DOUBLE PRECISION NOT NULL,
    "maxParcelVolumeM3" DOUBLE PRECISION NOT NULL,
    "occupiedWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "occupiedVolumeM3" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "managerId" TEXT NOT NULL,
    "kycId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hub_opening_hours" (
    "id" TEXT NOT NULL,
    "hubId" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryVerification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "otpCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryModification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "newOption" "DeliveryOption" NOT NULL,
    "newHubId" TEXT,
    "newTripStopId" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryModification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "openDate" TIMESTAMP(3),
    "openTime" TEXT,
    "closeTime" TEXT,
    "allowDropoff" BOOLEAN NOT NULL DEFAULT true,
    "allowPickup" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "transporteurId" TEXT NOT NULL,
    "tripId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "percentageRate" DOUBLE PRECISION NOT NULL,
    "minPremium" DOUBLE PRECISION NOT NULL,
    "maxCoverage" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingInsurance" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "declaredValue" DOUBLE PRECISION NOT NULL,
    "premiumAmount" DOUBLE PRECISION NOT NULL,
    "coverageAmount" DOUBLE PRECISION NOT NULL,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL,
    "insuranceId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "evidenceUrls" JSONB,
    "claimedAmount" DOUBLE PRECISION NOT NULL,
    "status" "InsuranceClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transporteur_ratings" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "transporteurId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "punctuality" INTEGER,
    "communication" INTEGER,
    "parcelCare" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transporteur_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPricing" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "serviceFeeFlat" DOUBLE PRECISION NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "hubPickupFee" DOUBLE PRECISION,
    "hubDeliveryFee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_userId_key" ON "EmailVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "Parcel_bookingId_idx" ON "Parcel"("bookingId");

-- CreateIndex
CREATE INDEX "bookings_tripId_idx" ON "bookings"("tripId");

-- CreateIndex
CREATE INDEX "bookings_originHubId_idx" ON "bookings"("originHubId");

-- CreateIndex
CREATE INDEX "bookings_destinationHubId_idx" ON "bookings"("destinationHubId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "BookingIssue_bookingId_idx" ON "BookingIssue"("bookingId");

-- CreateIndex
CREATE INDEX "scheduling_slots_tripId_idx" ON "scheduling_slots"("tripId");

-- CreateIndex
CREATE INDEX "scheduling_proposals_bookingId_idx" ON "scheduling_proposals"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_bookingId_key" ON "route_stops"("bookingId");

-- CreateIndex
CREATE INDEX "route_stops_tripId_order_idx" ON "route_stops"("tripId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "pickup_sessions_bookingId_key" ON "pickup_sessions"("bookingId");

-- CreateIndex
CREATE INDEX "pickup_sessions_bookingId_idx" ON "pickup_sessions"("bookingId");

-- CreateIndex
CREATE INDEX "pickup_sessions_handledById_idx" ON "pickup_sessions"("handledById");

-- CreateIndex
CREATE INDEX "HandoverEvent_batchId_idx" ON "HandoverEvent"("batchId");

-- CreateIndex
CREATE INDEX "HandoverEvent_parcelId_idx" ON "HandoverEvent"("parcelId");

-- CreateIndex
CREATE INDEX "HandoverEvent_bookingId_idx" ON "HandoverEvent"("bookingId");

-- CreateIndex
CREATE INDEX "HandoverEvent_fromUserId_idx" ON "HandoverEvent"("fromUserId");

-- CreateIndex
CREATE INDEX "HandoverEvent_toUserId_idx" ON "HandoverEvent"("toUserId");

-- CreateIndex
CREATE INDEX "HandoverEvent_fromHubId_idx" ON "HandoverEvent"("fromHubId");

-- CreateIndex
CREATE INDEX "HandoverEvent_toHubId_idx" ON "HandoverEvent"("toHubId");

-- CreateIndex
CREATE INDEX "HandoverBatch_destinationType_idx" ON "HandoverBatch"("destinationType");

-- CreateIndex
CREATE INDEX "HandoverBatch_hubId_idx" ON "HandoverBatch"("hubId");

-- CreateIndex
CREATE INDEX "HandoverBatch_tripStopId_idx" ON "HandoverBatch"("tripStopId");

-- CreateIndex
CREATE INDEX "HandoverBatch_destinationCity_idx" ON "HandoverBatch"("destinationCity");

-- CreateIndex
CREATE UNIQUE INDEX "HandoverBatchParcel_batchId_parcelId_key" ON "HandoverBatchParcel"("batchId", "parcelId");

-- CreateIndex
CREATE UNIQUE INDEX "HandoverToken_token_key" ON "HandoverToken"("token");

-- CreateIndex
CREATE INDEX "HandoverToken_batchId_idx" ON "HandoverToken"("batchId");

-- CreateIndex
CREATE INDEX "HandoverToken_parcelId_idx" ON "HandoverToken"("parcelId");

-- CreateIndex
CREATE INDEX "verification_artifacts_pickupId_idx" ON "verification_artifacts"("pickupId");

-- CreateIndex
CREATE INDEX "trips_departureCountry_departureCity_idx" ON "trips"("departureCountry", "departureCity");

-- CreateIndex
CREATE INDEX "trips_arrivalCountry_arrivalCity_idx" ON "trips"("arrivalCountry", "arrivalCity");

-- CreateIndex
CREATE UNIQUE INDEX "TripPricingRule_tripId_minKg_maxKg_key" ON "TripPricingRule"("tripId", "minKg", "maxKg");

-- CreateIndex
CREATE INDEX "tracking_events_bookingId_idx" ON "tracking_events"("bookingId");

-- CreateIndex
CREATE INDEX "tracking_events_parcelId_idx" ON "tracking_events"("parcelId");

-- CreateIndex
CREATE INDEX "tracking_events_tripId_idx" ON "tracking_events"("tripId");

-- CreateIndex
CREATE INDEX "tracking_events_eventType_idx" ON "tracking_events"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeIntentId_key" ON "payments"("stripeIntentId");

-- CreateIndex
CREATE INDEX "LedgerEntry_paymentId_idx" ON "LedgerEntry"("paymentId");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_bookingId_idx" ON "Dispute"("bookingId");

-- CreateIndex
CREATE INDEX "Kyc_status_idx" ON "Kyc"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userId_type_key" ON "Kyc"("userId", "type");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "hubs_country_city_idx" ON "hubs"("country", "city");

-- CreateIndex
CREATE INDEX "hubs_status_idx" ON "hubs"("status");

-- CreateIndex
CREATE INDEX "hub_opening_hours_hubId_day_idx" ON "hub_opening_hours"("hubId", "day");

-- CreateIndex
CREATE INDEX "trip_stops_country_city_idx" ON "trip_stops"("country", "city");

-- CreateIndex
CREATE INDEX "trip_stops_tripId_order_idx" ON "trip_stops"("tripId", "order");

-- CreateIndex
CREATE INDEX "trip_stops_transporteurId_idx" ON "trip_stops"("transporteurId");

-- CreateIndex
CREATE INDEX "BookingInsurance_bookingId_idx" ON "BookingInsurance"("bookingId");

-- CreateIndex
CREATE INDEX "BookingInsurance_status_idx" ON "BookingInsurance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingInsurance_bookingId_status_key" ON "BookingInsurance"("bookingId", "status");

-- CreateIndex
CREATE INDEX "insurance_claims_insuranceId_idx" ON "insurance_claims"("insuranceId");

-- CreateIndex
CREATE INDEX "insurance_claims_status_idx" ON "insurance_claims"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transporteur_ratings_bookingId_key" ON "transporteur_ratings"("bookingId");

-- CreateIndex
CREATE INDEX "transporteur_ratings_transporteurId_idx" ON "transporteur_ratings"("transporteurId");

-- CreateIndex
CREATE INDEX "PlatformPricing_country_idx" ON "PlatformPricing"("country");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformPricing_country_key" ON "PlatformPricing"("country");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "recipients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_originHubId_fkey" FOREIGN KEY ("originHubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_destinationHubId_fkey" FOREIGN KEY ("destinationHubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_dropoffTripStopId_fkey" FOREIGN KEY ("dropoffTripStopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_deliveryTripStopId_fkey" FOREIGN KEY ("deliveryTripStopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingIssue" ADD CONSTRAINT "BookingIssue_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingIssue" ADD CONSTRAINT "BookingIssue_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomsItem" ADD CONSTRAINT "CustomsItem_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_slots" ADD CONSTRAINT "scheduling_slots_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling_proposals" ADD CONSTRAINT "scheduling_proposals_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pickup_sessions" ADD CONSTRAINT "pickup_sessions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverEvent" ADD CONSTRAINT "HandoverEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "HandoverBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverEvent" ADD CONSTRAINT "HandoverEvent_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverEvent" ADD CONSTRAINT "HandoverEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverBatch" ADD CONSTRAINT "HandoverBatch_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverBatch" ADD CONSTRAINT "HandoverBatch_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "trip_stops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverBatchParcel" ADD CONSTRAINT "HandoverBatchParcel_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "HandoverBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverBatchParcel" ADD CONSTRAINT "HandoverBatchParcel_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_artifacts" ADD CONSTRAINT "verification_artifacts_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "pickup_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_transporteurId_fkey" FOREIGN KEY ("transporteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPricingRule" ADD CONSTRAINT "TripPricingRule_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubs" ADD CONSTRAINT "hubs_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubs" ADD CONSTRAINT "hubs_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "Kyc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_opening_hours" ADD CONSTRAINT "hub_opening_hours_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryVerification" ADD CONSTRAINT "DeliveryVerification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryModification" ADD CONSTRAINT "DeliveryModification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_transporteurId_fkey" FOREIGN KEY ("transporteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingInsurance" ADD CONSTRAINT "BookingInsurance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingInsurance" ADD CONSTRAINT "BookingInsurance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "insurance_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "BookingInsurance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transporteur_ratings" ADD CONSTRAINT "transporteur_ratings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transporteur_ratings" ADD CONSTRAINT "transporteur_ratings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transporteur_ratings" ADD CONSTRAINT "transporteur_ratings_transporteurId_fkey" FOREIGN KEY ("transporteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
