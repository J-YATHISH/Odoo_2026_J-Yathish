import prisma from '../../prisma/client';


// ─── Eco-Predictive Engine (Mathematical Heuristics) ─────────────────────────

export async function calculateAssetIntelligence() {
  const assets = await prisma.asset.findMany({
    where: { status: { in: ['AVAILABLE', 'ALLOCATED', 'RESERVED'] } },
    include: {
      category: true,
      _count: { select: { maintenanceReqs: true } },
      allocations: {
        where: { isActive: true },
        select: { allocatedAt: true },
      },
    },
  });

  const now = new Date();
  let processedCount = 0;
  let maintenanceGeneratedCount = 0;

  for (const asset of assets) {
    if (!asset.acquisitionDate) continue;

    const ageInMonths = (now.getTime() - asset.acquisitionDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const expectedLifespan = asset.category.expectedLifespanMonths;
    const maintenanceCount = asset._count.maintenanceReqs;

    // Health Score Math: Start at 100, lose points based on age ratio (up to 50 pts) and maintenance history (10 pts per repair)
    let healthScore = 100 - (ageInMonths / expectedLifespan) * 50 - (maintenanceCount * 10);
    healthScore = Math.max(0, Math.min(100, healthScore)); // Clamp between 0 and 100

    const failureProbability = 100 - healthScore;

    // EcoScore / Carbon Math
    // Assuming 'active hours' is roughly 8 hours per day since acquisition if allocated often.
    // For simplicity, we just use a formula based on age and power draw.
    const estimatedActiveHours = ageInMonths * 30 * 8; 
    // Carbon footprint = Base manufacturing footprint + (power draw in kW * hours * generic emission factor 0.4 kgCO2/kWh)
    const carbonFootprintKg = asset.category.baseCarbonFootprintKg + ((asset.category.powerDrawWatts / 1000) * estimatedActiveHours * 0.4);

    await prisma.assetIntelligence.upsert({
      where: { assetId: asset.id },
      create: {
        assetId: asset.id,
        healthScore,
        failureProbability,
        carbonFootprintKg,
        lastCalculatedAt: now,
      },
      update: {
        healthScore,
        failureProbability,
        carbonFootprintKg,
        lastCalculatedAt: now,
      },
    });

    processedCount++;

    // Autonomous Action: Generate Maintenance Request if high risk
    if (failureProbability > 85 && asset.status !== 'UNDER_MAINTENANCE') {
      const existingReq = await prisma.maintenanceRequest.findFirst({
        where: { assetId: asset.id, status: { in: ['PENDING', 'IN_PROGRESS', 'TECHNICIAN_ASSIGNED', 'APPROVED'] } },
      });

      if (!existingReq) {
        // We need an employee to assign as 'raisedBy'. We will assign it to the first Admin in the organization.
        const adminUser = await prisma.employee.findFirst({
          where: { organizationId: asset.organizationId, role: { permissions: { has: 'MANAGE_MAINTENANCE' } } },
        });

        if (adminUser) {
          await prisma.maintenanceRequest.create({
            data: {
              organizationId: asset.organizationId,
              assetId: asset.id,
              raisedById: adminUser.id,
              issueDescription: `AUTONOMOUS SYSTEM ALERT: Predictive failure probability has reached ${failureProbability.toFixed(1)}%. Health Score: ${healthScore.toFixed(1)}. Preventative maintenance is highly recommended.`,
              priority: 'High',
            },
          });
          maintenanceGeneratedCount++;
        }
      }
    }
  }

  return { processedCount, maintenanceGeneratedCount };
}

// ─── Cross-Tenant Benchmarking Engine (SQL Aggregations) ─────────────────────

export async function getGlobalBenchmarks(organizationId: number) {
  // We use raw SQL queries to do efficient cross-tenant aggregations without pulling everything into Node.

  // 1. Maintenance Resolution Speed (Average hours to resolve)
  const maintenanceQuery = await prisma.$queryRaw`
    SELECT 
      "organizationId",
      AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt"))/3600) as avg_resolution_hours
    FROM "MaintenanceRequest"
    WHERE "status" = 'RESOLVED' AND "resolvedAt" IS NOT NULL
    GROUP BY "organizationId"
  ` as any[];

  let orgResolutionHours = 0;
  let globalResolutionHours = 0;
  let totalOrgs = 0;

  for (const row of maintenanceQuery) {
    const val = parseFloat(row.avg_resolution_hours);
    if (row.organizationId === organizationId) orgResolutionHours = val;
    globalResolutionHours += val;
    totalOrgs++;
  }
  globalResolutionHours = totalOrgs > 0 ? globalResolutionHours / totalOrgs : 0;

  // 2. Hardware Reliability (Maintenance counts per category globally)
  const reliabilityQuery = await prisma.$queryRaw`
    SELECT 
      c.name as "categoryName",
      COUNT(m.id) as "maintenanceCount"
    FROM "MaintenanceRequest" m
    JOIN "assets" a ON m."assetId" = a.id
    JOIN "AssetCategory" c ON a."categoryId" = c.id
    GROUP BY c.name
    ORDER BY "maintenanceCount" DESC
  ` as any[];

  // 3. Asset Utilization (% of Assets Allocated vs Total)
  const utilizationQuery = await prisma.$queryRaw`
    SELECT 
      "organizationId",
      COUNT(*) FILTER (WHERE "status" = 'ALLOCATED')::float / GREATEST(COUNT(*), 1) * 100 as utilization_pct
    FROM "assets"
    WHERE "status" NOT IN ('RETIRED', 'DISPOSED', 'LOST')
    GROUP BY "organizationId"
  ` as any[];

  let orgUtilization = 0;
  let globalUtilization = 0;

  for (const row of utilizationQuery) {
    const val = parseFloat(row.utilization_pct);
    if (row.organizationId === organizationId) orgUtilization = val;
    globalUtilization += val;
  }
  globalUtilization = utilizationQuery.length > 0 ? globalUtilization / utilizationQuery.length : 0;

  return {
    maintenance: {
      organizationAverageHours: orgResolutionHours,
      globalAverageHours: globalResolutionHours,
      verdict: orgResolutionHours < globalResolutionHours ? 'Faster than average' : 'Slower than average',
    },
    hardwareReliability: reliabilityQuery.map(r => ({ category: r.categoryName, incidents: Number(r.maintenanceCount) })),
    utilization: {
      organizationUtilizationPct: orgUtilization,
      globalUtilizationPct: globalUtilization,
    }
  };
}

export async function getOrganizationIntelligence(organizationId: number) {
  const assets = await prisma.assetIntelligence.findMany({
    where: { asset: { organizationId } },
    include: { asset: { select: { tag: true, name: true, category: { select: { name: true } } } } },
    orderBy: { failureProbability: 'desc' },
    take: 10,
  });

  const totalCarbon = await prisma.assetIntelligence.aggregate({
    where: { asset: { organizationId } },
    _sum: { carbonFootprintKg: true },
  });

  return {
    topAtRiskAssets: assets,
    totalOrganizationCarbonFootprintKg: totalCarbon._sum.carbonFootprintKg || 0,
  };
}
