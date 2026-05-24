// ============================================================
// Demo Seeder – Prefills 10 realistic complaints
// ============================================================

require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const Log = require('./models/Log');
const { appendLog } = require('./utils/hashChain');
const { generateSummary } = require('./utils/aiSummary');

let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlayer';
if (MONGODB_URI.includes('<db_password>') || MONGODB_URI.includes('<password>')) {
  MONGODB_URI = 'mongodb://localhost:27017/trustlayer';
}

const demoComplaints = [
  {
    type: 'voice',
    originalText: 'There is no water supply in our area for the past 3 days. The main pipeline is broken near Rajaji Nagar main road. Many families including elderly people and children are suffering without drinking water. This is an urgent situation.',
    location: 'Rajaji Nagar, Bangalore',
    status: 'in-progress',
    assignedOfficer: 'Sri. Ramesh Kumar',
    validations: 12,
    notes: [{ text: 'Maintenance team dispatched. Expected fix in 24 hours.', timestamp: new Date(Date.now() - 3600000), author: 'Admin' }]
  },
  {
    type: 'voice',
    originalText: 'The road in front of Gandhi School in Whitefield has developed dangerous potholes. Two accidents happened last week. One child was injured while cycling to school. Immediate repair is needed before more people get hurt.',
    location: 'Whitefield, Bangalore',
    status: 'verified',
    validations: 23,
    notes: []
  },
  {
    type: 'text',
    originalText: 'Garbage has not been collected in our colony in Jayanagar 4th Block for 2 weeks. The waste is piling up near the bus stop and causing terrible smell and health issues. Mosquito breeding has increased. Several residents have fallen sick.',
    location: 'Jayanagar 4th Block, Bangalore',
    status: 'assigned',
    assignedOfficer: 'Smt. Lakshmi Devi',
    validations: 8,
    notes: [{ text: 'BBMP waste collection unit notified.', timestamp: new Date(Date.now() - 7200000), author: 'Admin' }]
  },
  {
    type: 'voice',
    originalText: 'Street lights are not working in Koramangala 4th Block for the past month. The entire stretch from 4th Block to 6th Block is completely dark at night. It is very unsafe for women and children. Multiple complaints to BESCOM have been ignored.',
    location: 'Koramangala 4th Block, Bangalore',
    status: 'submitted',
    validations: 15,
    notes: []
  },
  {
    type: 'text',
    originalText: 'There is sewage overflow near the children park in Malleshwaram 15th Cross. Raw sewage is flowing on the road and entering nearby houses. Children cannot play in the park. Urgent action needed to prevent disease outbreak.',
    location: 'Malleshwaram 15th Cross, Bangalore',
    status: 'resolved',
    assignedOfficer: 'Sri. Venkatesh B.',
    validations: 19,
    notes: [
      { text: 'Sewage line cleared and repaired.', timestamp: new Date(Date.now() - 86400000), author: 'Admin' },
      { text: 'Follow-up inspection completed. Issue resolved.', timestamp: new Date(Date.now() - 43200000), author: 'Admin' }
    ]
  },
  {
    type: 'voice',
    originalText: 'The government hospital in Yelahanka has no medicines in stock. Patients are being turned away or asked to buy medicines from private pharmacies. This is affecting poor families who cannot afford private medical care. The situation has been going on for weeks.',
    location: 'Yelahanka, Bangalore',
    status: 'in-progress',
    assignedOfficer: 'Dr. Priya Sharma',
    validations: 31,
    notes: [{ text: 'Health department notified. Emergency medicine supply being arranged.', timestamp: new Date(Date.now() - 14400000), author: 'Admin' }]
  },
  {
    type: 'text',
    originalText: 'Illegal construction is blocking the public drainage channel in HSR Layout Sector 2. The builder has encroached on government land and diverted the drain. During last week rains, our entire street was flooded with 2 feet of water causing damage to property.',
    location: 'HSR Layout Sector 2, Bangalore',
    status: 'verified',
    validations: 27,
    notes: []
  },
  {
    type: 'voice',
    originalText: 'The primary school building in Basavanagudi has developed large cracks in the walls and ceiling. Plaster is falling during class hours. The building is in dangerous condition and children are at risk. Parents are afraid to send children to school.',
    location: 'Basavanagudi, Bangalore',
    status: 'assigned',
    assignedOfficer: 'Sri. Mohan Raj',
    validations: 34,
    notes: [{ text: 'Structural engineer inspection scheduled for tomorrow.', timestamp: new Date(Date.now() - 1800000), author: 'Admin' }]
  },
  {
    type: 'text',
    originalText: 'Corruption at the local RTO office in Indiranagar. Officials are openly demanding bribes of 500 to 2000 rupees for driving license renewal. The process that should take 30 minutes is deliberately delayed to force people to pay.',
    location: 'Indiranagar, Bangalore',
    status: 'submitted',
    validations: 42,
    notes: []
  },
  {
    type: 'voice',
    originalText: 'Power cuts happening daily for 4 to 5 hours in Electronic City Phase 2. There is no prior notice and the outages are completely random. This is severely affecting IT companies and employees working from home. Transformer is old and needs replacement.',
    location: 'Electronic City Phase 2, Bangalore',
    status: 'in-progress',
    assignedOfficer: 'Sri. Suresh N.',
    validations: 18,
    notes: [{ text: 'BESCOM engineer team assigned. Transformer replacement approved.', timestamp: new Date(Date.now() - 5400000), author: 'Admin' }]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Complaint.deleteMany({});
    await Log.deleteMany({});
    console.log('🗑️  Cleared existing data');

    for (let i = 0; i < demoComplaints.length; i++) {
      const data = demoComplaints[i];
      const aiSummary = generateSummary(data.originalText);
      aiSummary.location = data.location;

      // Generate unique IDs
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let grievanceId = 'TL-';
      for (let j = 0; j < 6; j++) {
        grievanceId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      const complaint = new Complaint({
        grievanceId,
        pin,
        type: data.type,
        originalText: data.originalText,
        description: data.originalText,
        aiSummary,
        location: data.location,
        status: data.status,
        assignedOfficer: data.assignedOfficer || '',
        validations: data.validations,
        notes: data.notes,
        statusHistory: [
          { status: 'submitted', timestamp: new Date(Date.now() - 604800000), note: 'Complaint submitted' }
        ],
        createdAt: new Date(Date.now() - 604800000 + i * 86400000)
      });

      // Add status history entries
      const statusOrder = ['submitted', 'verified', 'assigned', 'in-progress', 'resolved'];
      const currentIdx = statusOrder.indexOf(data.status);
      for (let s = 1; s <= currentIdx; s++) {
        complaint.statusHistory.push({
          status: statusOrder[s],
          timestamp: new Date(Date.now() - (604800000 - s * 86400000)),
          note: `Status updated to ${statusOrder[s]}`
        });
      }

      await complaint.save();

      // Create hash chain logs
      await appendLog({
        complaintId: complaint._id,
        grievanceId,
        action: 'COMPLAINT_SUBMITTED',
        actionData: { type: data.type, issueType: aiSummary.issueType, severity: aiSummary.severity },
        actor: 'citizen'
      });

      if (currentIdx >= 1) {
        await appendLog({
          complaintId: complaint._id,
          grievanceId,
          action: 'COMPLAINT_VERIFIED',
          actionData: { status: 'verified' },
          actor: 'admin'
        });
      }

      if (data.assignedOfficer) {
        await appendLog({
          complaintId: complaint._id,
          grievanceId,
          action: 'OFFICER_ASSIGNED',
          actionData: { officer: data.assignedOfficer },
          actor: 'admin'
        });
      }

      for (const note of data.notes) {
        await appendLog({
          complaintId: complaint._id,
          grievanceId,
          action: 'NOTE_ADDED',
          actionData: { note: note.text },
          actor: 'admin'
        });
      }

      console.log(`  ✅ Created: ${grievanceId} (PIN: ${pin}) — ${aiSummary.issueType} [${data.status}]`);
    }

    console.log('\n🎉 Demo data seeded successfully!');
    console.log('📋 Use the grievance IDs and PINs above to test tracking.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
