// ข้อมูลปลอมสำหรับใช้ตอนยังไม่ต่อ BE — รูปแบบต้องตรงกับที่ GET /api/portfolio คืนมา
// field ที่ลงท้ายด้วย _en เป็น optional ใช้ตอนเลือกภาษาอังกฤษ
// TODO: ข้อมูล Peem ยังเป็นตัวอย่าง ต้องแก้ให้ตรงกับ BE/portfolio.json ของจริง
export const mockPortfolio = {
  group: {
    name: '404 Brain Not Found',
    tagline: 'Detective Development Team',
    description:
      'ทีมพัฒนาซอฟต์แวร์ผู้ไขปริศนาด้วยเทคโนโลยี ด้าน AI, Software Engineering และระบบฮาร์ดแวร์',
    description_en:
      'A detective-inspired development team solving problems with AI, software engineering and hardware.',
    contact: {
      email: 'team404@example.com',
      github: 'https://github.com/',
    },
    projects: [
      {
        id: 'plant-watering',
        title: 'Automatic Plant Watering',
        description: 'ระบบรดน้ำต้นไม้อัตโนมัติด้วยเซนเซอร์และไมโครคอนโทรลเลอร์',
        description_en: 'Automatic plant watering with sensors and a microcontroller.',
        tags: ['Arduino', 'IoT', 'Sensors'],
        icon: 'plant',
      },
      {
        id: 'concrete-optimization',
        title: 'AI Concrete Optimization',
        description: 'วางแผนการขนส่งคอนกรีตเพื่อเพิ่มประสิทธิภาพและลดต้นทุน',
        description_en: 'Plans concrete production and delivery to cut cost and delay.',
        tags: ['Python', 'Optimization', 'VRP'],
        icon: 'factory',
      },
      {
        id: 'ros2-person-detection',
        title: 'ROS2 Person Detection',
        description: 'ระบบตรวจจับบุคคลโดยใช้ YOLO และ ROS2 สำหรับงานหุ่นยนต์',
        description_en: 'Person detection for robots using YOLO and ROS2.',
        tags: ['ROS2', 'YOLO', 'Computer Vision'],
        icon: 'robot',
      },
      {
        id: 'unilink',
        title: 'UniLink',
        description: 'ระบบเครือข่ายสังคมออนไลน์สำหรับนักศึกษา พร้อมฟีดและแชต',
        description_en: 'A social network for students with a feed and chat.',
        tags: ['React', 'Express', 'PostgreSQL'],
        icon: 'web',
      },
    ],
  },
  members: [
    {
      id: 'tonn',
      code: 'AGENT-001',
      name: 'Tonn Parker',
      role: 'Backend / AI / Robotics',
      bio: 'สนใจงานพัฒนาระบบ AI, Robotics, Hardware และ Infrastructure โดยเน้นการเชื่อมต่อซอฟต์แวร์กับระบบจริง รวมถึงการพัฒนาแอปพลิเคชันและฐานข้อมูล',
      bio_en:
        'Interested in AI, robotics, hardware and infrastructure, with a focus on connecting software to real systems, plus application and database development.',
      skills: ['Python', 'SQL', 'Arduino', 'ROS2', 'AI / ML', 'Linux'],
      projects: ['plant-watering', 'ros2-person-detection', 'unilink'],
      photo: null,
      contact: { email: 'tonn@example.com', github: 'https://github.com/' },
    },
    {
      id: 'peem',
      code: 'AGENT-002',
      name: 'Peem',
      role: 'Frontend Developer',
      bio: '(ข้อมูลตัวอย่าง) รอใส่ประวัติจริง ความสนใจ และประสบการณ์',
      bio_en: '(Sample data) Real biography pending.',
      skills: ['React', 'JavaScript', 'CSS', 'Git'],
      projects: ['concrete-optimization', 'unilink'],
      photo: null,
      contact: { email: 'peem@example.com', github: 'https://github.com/' },
    },
  ],
};
