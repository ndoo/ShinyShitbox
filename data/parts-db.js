// Auto-generated from data/parts-db.json — do not edit directly.
// Run: node scripts/update-parts-db.js
window.PARTS_DB = {
  "version": "2026-05-01",
  "_comment": "Toyota/Daihatsu parts database. Maintenance intervals sourced from official service schedules. Run /update-parts-db to refresh.",
  "makes": {
    "toyota": {
      "models": {
        "corolla": {
          "years": "1993-2024",
          "engine_variants": [
            "1ZZ-FE",
            "2ZR-FE",
            "2ZR-FAE",
            "1NZ-FE"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "Full synthetic recommended for 2ZR-FE and later. Use 0W-20 for newer ZR engines."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 40000,
              "daysInterval": 730,
              "notes": "Inspect every 20,000 km in dusty conditions."
            },
            "cabin-air-filter": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "spark-plugs": {
              "kmInterval": 30000,
              "daysInterval": 1460,
              "variants": {
                "Copper/Nickel": {
                  "kmInterval": 30000,
                  "daysInterval": 1460
                },
                "Platinum": {
                  "kmInterval": 60000,
                  "daysInterval": 2190
                },
                "Iridium": {
                  "kmInterval": 100000,
                  "daysInterval": 3650,
                  "notes": "Pre-fitted in later ZR-FE engines."
                }
              }
            },
            "timing-belt": {
              "kmInterval": 100000,
              "daysInterval": 1825,
              "critical": true,
              "notes": "1ZZ-FE has timing chain (inspect only). 2ZR-FE uses timing chain. Check your engine variant."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 40000,
              "daysInterval": null
            },
            "brake-pads-rear": {
              "kmInterval": 50000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730,
              "notes": "Toyota Super Long Life Coolant (pink). First change at 160,000 km or 10 years if SLLC fitted from factory."
            },
            "transmission-fluid-auto": {
              "kmInterval": 80000,
              "daysInterval": 1825,
              "notes": "Toyota WS fluid. Inspect condition; change if contaminated."
            },
            "battery": {
              "kmInterval": null,
              "daysInterval": 1460
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "90915-YZZD3",
                "description": "Oil Filter (spin-on)",
                "years": "2007-2019",
                "notes": "2ZR-FE"
              },
              {
                "partNumber": "90915-YZZB2",
                "description": "Oil Filter (spin-on)",
                "years": "2002-2006",
                "notes": "1ZZ-FE"
              },
              {
                "partNumber": "04152-YZZA6",
                "description": "Oil Filter Element Kit",
                "years": "2019+",
                "notes": "Cartridge type on newer models"
              }
            ],
            "air-filter-engine": [
              {
                "partNumber": "17801-21050",
                "description": "Air Filter Element",
                "years": "2007-2013"
              },
              {
                "partNumber": "17801-21060",
                "description": "Air Filter Element",
                "years": "2014-2019"
              }
            ],
            "cabin-air-filter": [
              {
                "partNumber": "87139-0D040",
                "description": "Cabin Air Filter",
                "years": "2007-2019"
              }
            ],
            "spark-plugs": [
              {
                "partNumber": "90919-01253",
                "description": "Spark Plug (Nickel)",
                "years": "2007-2013",
                "notes": "OEM Denso SK20HR11",
                "variant": "Copper/Nickel"
              },
              {
                "partNumber": "90919-01247",
                "description": "Spark Plug (Iridium)",
                "years": "2007-2019",
                "notes": "OEM Denso SK20HR11 Iridium",
                "variant": "Iridium"
              }
            ]
          }
        },
        "camry": {
          "years": "1993-2024",
          "engine_variants": [
            "5S-FE",
            "2AZ-FE",
            "2AR-FE",
            "A25A-FKS"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "0W-20 recommended for A25A-FKS (2019+). 5W-30 for 2AZ-FE."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "cabin-air-filter": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "spark-plugs": {
              "kmInterval": 120000,
              "daysInterval": 3650,
              "variants": {
                "Iridium": {
                  "kmInterval": 120000,
                  "daysInterval": 3650
                }
              }
            },
            "timing-belt": {
              "kmInterval": 100000,
              "daysInterval": 1825,
              "critical": true,
              "notes": "2AZ-FE and later use timing chain."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 50000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 80000,
              "daysInterval": 1825
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "90915-YZZD4",
                "description": "Oil Filter (2AZ-FE)",
                "years": "2002-2011"
              },
              {
                "partNumber": "04152-YZZA6",
                "description": "Oil Filter Element",
                "years": "2012+"
              }
            ]
          }
        },
        "hilux": {
          "years": "2005-2024",
          "engine_variants": [
            "1KD-FTV",
            "2KD-FTV",
            "2GD-FTV",
            "1GR-FE"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "5W-30 or 15W-40. Use diesel-spec oil for KD/GD engines (API CI-4 or better)."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 20000,
              "daysInterval": 365,
              "notes": "Halve interval in dusty/off-road conditions."
            },
            "fuel-filter": {
              "kmInterval": 20000,
              "daysInterval": 365,
              "notes": "Diesel fuel filter critical — water separator included. Drain water monthly."
            },
            "timing-belt": {
              "kmInterval": 150000,
              "daysInterval": 1825,
              "critical": true,
              "notes": "1KD-FTV and 2KD-FTV have timing chain (no belt). 2GD-FTV also chain."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 40000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 40000,
              "daysInterval": 1460,
              "notes": "More frequent under towing/off-road use."
            },
            "differential-fluid-rear": {
              "kmInterval": 40000,
              "daysInterval": 1460
            },
            "differential-fluid-front": {
              "kmInterval": 40000,
              "daysInterval": 1460
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "90915-10001",
                "description": "Oil Filter (1KD/2KD-FTV)",
                "years": "2005-2015"
              },
              {
                "partNumber": "90915-10003",
                "description": "Oil Filter (2GD-FTV)",
                "years": "2015+"
              }
            ],
            "fuel-filter": [
              {
                "partNumber": "23390-0L070",
                "description": "Fuel Filter Assembly w/ Water Sensor",
                "years": "2015+"
              }
            ]
          }
        },
        "hiace": {
          "years": "1996-2024",
          "engine_variants": [
            "2TR-FE",
            "1KD-FTV",
            "2KD-FTV",
            "1GD-FTV"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "5W-30 for petrol 2TR-FE; 5W-30 or 15W-40 diesel-spec for KD/GD engines."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "fuel-filter": {
              "kmInterval": 20000,
              "daysInterval": 365,
              "notes": "Diesel models only — drain water separator regularly."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 40000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 60000,
              "daysInterval": 1825
            },
            "spark-plugs": {
              "kmInterval": 100000,
              "daysInterval": 3650,
              "notes": "Petrol 2TR-FE only.",
              "variants": {
                "Iridium": {
                  "kmInterval": 100000,
                  "daysInterval": 3650
                }
              }
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "90915-10001",
                "description": "Oil Filter (diesel)",
                "years": "2005-2019"
              },
              {
                "partNumber": "90915-YZZD3",
                "description": "Oil Filter (2TR-FE petrol)",
                "years": "2005-2019"
              }
            ]
          }
        },
        "landcruiser-200": {
          "years": "2007-2021",
          "engine_variants": [
            "1UR-FE",
            "1VD-FTV"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "5W-30 full synthetic. 1VD-FTV diesel requires CI-4+ spec."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "fuel-filter": {
              "kmInterval": 20000,
              "daysInterval": 365,
              "notes": "Diesel only."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 40000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 80000,
              "daysInterval": 1825
            },
            "differential-fluid-rear": {
              "kmInterval": 40000,
              "daysInterval": 1460
            },
            "differential-fluid-front": {
              "kmInterval": 40000,
              "daysInterval": 1460
            },
            "spark-plugs": {
              "kmInterval": 100000,
              "daysInterval": 3650,
              "notes": "Petrol 1UR-FE only.",
              "variants": {
                "Iridium": {
                  "kmInterval": 100000,
                  "daysInterval": 3650
                }
              }
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "04152-YZZA6",
                "description": "Oil Filter Element",
                "years": "2007-2021"
              }
            ]
          }
        },
        "landcruiser-prado": {
          "years": "1996-2024",
          "engine_variants": [
            "1KZ-TE",
            "3RZ-FE",
            "1GR-FE",
            "1KD-FTV",
            "2TR-FE",
            "1GD-FTV"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "fuel-filter": {
              "kmInterval": 20000,
              "daysInterval": 365,
              "notes": "Diesel only."
            },
            "timing-belt": {
              "kmInterval": 100000,
              "daysInterval": 1825,
              "critical": true,
              "notes": "1KZ-TE has belt. 1KD-FTV and later use chain."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 40000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 60000,
              "daysInterval": 1825
            },
            "differential-fluid-rear": {
              "kmInterval": 40000,
              "daysInterval": 1460
            },
            "differential-fluid-front": {
              "kmInterval": 40000,
              "daysInterval": 1460
            }
          },
          "parts": {}
        },
        "yaris": {
          "years": "1999-2024",
          "engine_variants": [
            "1NZ-FE",
            "2NZ-FE",
            "1KR-FE",
            "2KR-FKS"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "0W-20 for newer models."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "cabin-air-filter": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "spark-plugs": {
              "kmInterval": 100000,
              "daysInterval": 3650,
              "variants": {
                "Iridium": {
                  "kmInterval": 100000,
                  "daysInterval": 3650
                }
              }
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "90915-YZZB2",
                "description": "Oil Filter",
                "years": "1999-2010"
              },
              {
                "partNumber": "90915-YZZD3",
                "description": "Oil Filter",
                "years": "2011+"
              }
            ]
          }
        },
        "rav4": {
          "years": "1996-2024",
          "engine_variants": [
            "3S-FE",
            "2AZ-FE",
            "2AR-FXE",
            "M20A-FKS"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "0W-20 for M20A-FKS (2019+). 5W-30 for 2AZ-FE."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "cabin-air-filter": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "spark-plugs": {
              "kmInterval": 120000,
              "daysInterval": 3650,
              "variants": {
                "Iridium": {
                  "kmInterval": 120000,
                  "daysInterval": 3650
                }
              }
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 80000,
              "daysInterval": 1825
            }
          },
          "parts": {}
        },
        "fortuner": {
          "years": "2005-2024",
          "engine_variants": [
            "2KD-FTV",
            "1GD-FTV",
            "2TR-FE"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "fuel-filter": {
              "kmInterval": 20000,
              "daysInterval": 365,
              "notes": "Diesel models."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "brake-pads-front": {
              "kmInterval": 40000,
              "daysInterval": null
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "transmission-fluid-auto": {
              "kmInterval": 60000,
              "daysInterval": 1825
            },
            "differential-fluid-rear": {
              "kmInterval": 40000,
              "daysInterval": 1460
            }
          },
          "parts": {
            "oil-filter": [
              {
                "partNumber": "90915-10003",
                "description": "Oil Filter (1GD-FTV)",
                "years": "2015+"
              },
              {
                "partNumber": "90915-10001",
                "description": "Oil Filter (2KD-FTV)",
                "years": "2005-2015"
              }
            ]
          }
        }
      }
    },
    "daihatsu": {
      "models": {
        "terios": {
          "years": "1997-2013",
          "engine_variants": [
            "EF-EL",
            "EF-DEM",
            "K3-VE"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "5W-30 semi or full synthetic recommended."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "timing-belt": {
              "kmInterval": 100000,
              "daysInterval": 1825,
              "critical": true
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "spark-plugs": {
              "kmInterval": 30000,
              "daysInterval": 1460,
              "variants": {
                "Copper/Nickel": {
                  "kmInterval": 30000,
                  "daysInterval": 1460
                },
                "Platinum": {
                  "kmInterval": 60000,
                  "daysInterval": 2190
                },
                "Iridium": {
                  "kmInterval": 80000,
                  "daysInterval": 3650
                }
              }
            }
          },
          "parts": {}
        },
        "sirion": {
          "years": "1998-2014",
          "engine_variants": [
            "EJ-DE",
            "EJ-VE",
            "K3-VE"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "5W-30. Use full synthetic for turbo if applicable."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "timing-belt": {
              "kmInterval": 100000,
              "daysInterval": 1825,
              "critical": true
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "spark-plugs": {
              "kmInterval": 30000,
              "daysInterval": 1460,
              "variants": {
                "Copper/Nickel": {
                  "kmInterval": 30000,
                  "daysInterval": 1460
                },
                "Platinum": {
                  "kmInterval": 60000,
                  "daysInterval": 2190
                },
                "Iridium": {
                  "kmInterval": 80000,
                  "daysInterval": 3650
                }
              }
            }
          },
          "parts": {}
        },
        "rocky": {
          "years": "1989-2002",
          "engine_variants": [
            "HE-EG",
            "DL",
            "2.8L diesel"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 5000,
              "daysInterval": 180,
              "notes": "Older engine — 10W-40 or 15W-40 recommended."
            },
            "oil-filter": {
              "kmInterval": 5000,
              "daysInterval": 180
            },
            "air-filter-engine": {
              "kmInterval": 20000,
              "daysInterval": 365
            },
            "timing-belt": {
              "kmInterval": 80000,
              "daysInterval": 1825,
              "critical": true
            },
            "brake-fluid": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 30000,
              "daysInterval": 730
            }
          },
          "parts": {}
        },
        "copen": {
          "years": "2002-2014",
          "engine_variants": [
            "JB-DET"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 5000,
              "daysInterval": 180,
              "notes": "TURBO engine — 5W-30 full synthetic mandatory. 5,000 km interval strictly."
            },
            "oil-filter": {
              "kmInterval": 5000,
              "daysInterval": 180
            },
            "air-filter-engine": {
              "kmInterval": 20000,
              "daysInterval": 730
            },
            "spark-plugs": {
              "kmInterval": 20000,
              "daysInterval": 1460,
              "notes": "Turbo engine — shorter interval mandatory.",
              "variants": {
                "Copper/Nickel": {
                  "kmInterval": 20000,
                  "daysInterval": 1460
                },
                "Iridium": {
                  "kmInterval": 20000,
                  "daysInterval": 1460,
                  "notes": "NGK BKR6EIX recommended for JB-DET turbo."
                }
              }
            },
            "timing-belt": {
              "kmInterval": 80000,
              "daysInterval": 1825,
              "critical": true
            },
            "brake-fluid": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            }
          },
          "parts": {}
        },
        "move": {
          "years": "1995-2024",
          "engine_variants": [
            "EF-SE",
            "EF-VE",
            "KF-VE",
            "KF-DET"
          ],
          "maintenance": {
            "engine-oil": {
              "kmInterval": 10000,
              "daysInterval": 365,
              "notes": "0W-20 for newer KF engines. 5,000 km for KF-DET turbo."
            },
            "oil-filter": {
              "kmInterval": 10000,
              "daysInterval": 365
            },
            "air-filter-engine": {
              "kmInterval": 30000,
              "daysInterval": 730
            },
            "timing-belt": {
              "kmInterval": 100000,
              "daysInterval": 1825,
              "critical": true,
              "notes": "Older EF/KF may use timing chain — verify."
            },
            "brake-fluid": {
              "kmInterval": 40000,
              "daysInterval": 730
            },
            "coolant": {
              "kmInterval": 40000,
              "daysInterval": 730
            }
          },
          "parts": {}
        }
      }
    }
  }
};
