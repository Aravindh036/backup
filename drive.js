var json = [
  {
    device: "\\\\.\\PHYSICALDRIVE0",
    displayName: "C:",
    description: "WDC WD10JPVX-75JC3T0",
    size: 68719476736,
    mountpoints: [
      {
        path: "C:"
      }
    ],
    raw: "\\\\.\\PHYSICALDRIVE0",
    protected: false,
    system: true
  },
  {
    device: "\\\\.\\PHYSICALDRIVE1",
    displayName: "D:, F:",
    description: "Generic STORAGE DEVICE USB Device",
    size: 7823458304,
    mountpoints: [
      {
        path: "D:"
      },
      {
        path: "F:"
      }
    ],
    raw: "\\\\.\\PHYSICALDRIVE1",
    protected: true,
    system: false
  }
];

module.export = { json };
