window.searchIndex = {
  fields: ["title", "body"],
  pipeline: ["trimmer", "stopWordFilter", "stemmer"],
  ref: "id",
  version: "0.9.5",
  index: {
    body: {
      root: {
        docs: {},
        df: 0,
        0: {
          docs: {
            "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/components/": { tf: 2.8284271247461903 },
            "https://javelin.games/ecs/effects/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/entities/": { tf: 1.0 },
            "https://javelin.games/ecs/systems/": { tf: 1.0 },
            "https://javelin.games/ecs/topics/": { tf: 1.4142135623730951 },
          },
          df: 6,
          ".": {
            docs: {},
            df: 0,
            ".": {
              docs: {},
              df: 0,
              n: {
                docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                df: 1,
              },
            },
            3: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                b: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
        },
        1: {
          docs: {
            "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
            "https://javelin.games/ecs/components/": { tf: 1.7320508075688772 },
            "https://javelin.games/ecs/effects/": { tf: 1.0 },
            "https://javelin.games/ecs/entities/": { tf: 1.0 },
          },
          df: 4,
          0: {
            docs: {
              "https://javelin.games/ecs/components/": { tf: 1.0 },
              "https://javelin.games/ecs/performance/": {
                tf: 1.7320508075688772,
              },
            },
            df: 2,
            0: {
              docs: {
                "https://javelin.games/ecs/components/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/entities/": { tf: 1.0 },
              },
              df: 2,
              0: {
                docs: {
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 3,
                0: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                  },
                  df: 1,
                },
                m: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
            },
            3: {
              docs: {},
              df: 0,
              ".": {
                docs: {},
                df: 0,
                3: {
                  docs: {},
                  df: 0,
                  5: {
                    docs: {},
                    df: 0,
                    8: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            "^": {
              docs: {},
              df: 0,
              3: {
                docs: { "https://javelin.games/ecs/components/": { tf: 1.0 } },
                df: 1,
              },
              5: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
            },
            k: {
              docs: {
                "https://javelin.games/ecs/performance/": {
                  tf: 1.4142135623730951,
                },
              },
              df: 1,
            },
          },
          3: {
            docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
            df: 1,
          },
          6: {
            docs: {},
            df: 0,
            ".": {
              docs: {},
              df: 0,
              6: {
                docs: {},
                df: 0,
                2: {
                  docs: {},
                  df: 0,
                  4: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
                6: {
                  docs: {},
                  df: 0,
                  6: {
                    docs: {},
                    df: 0,
                    6: {
                      docs: {},
                      df: 0,
                      6: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                        6: {
                          docs: {},
                          df: 0,
                          6: {
                            docs: {},
                            df: 0,
                            6: {
                              docs: {
                                "https://javelin.games/ecs/systems/": {
                                  tf: 1.7320508075688772,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          7: {
            docs: {},
            df: 0,
            ".": {
              docs: {},
              df: 0,
              0: {
                docs: {},
                df: 0,
                1: {
                  docs: {},
                  df: 0,
                  5: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
        },
        2: {
          docs: {
            "https://javelin.games/ecs/change-detection/": {
              tf: 1.4142135623730951,
            },
            "https://javelin.games/ecs/components/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/effects/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/entities/": { tf: 1.0 },
            "https://javelin.games/ecs/performance/": { tf: 1.0 },
            "https://javelin.games/ecs/systems/": { tf: 1.0 },
            "https://javelin.games/ecs/topics/": { tf: 1.4142135623730951 },
          },
          df: 7,
          ".": {
            docs: {},
            df: 0,
            3: {
              docs: {},
              df: 0,
              m: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          0: {
            docs: { "https://javelin.games/ecs/components/": { tf: 1.0 } },
            df: 1,
            2: {
              docs: {},
              df: 0,
              0: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          3: {
            docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
            df: 1,
          },
          4: {
            docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
            df: 1,
          },
          g: {
            docs: {},
            df: 0,
            h: {
              docs: {},
              df: 0,
              z: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
        },
        3: {
          docs: {
            "https://javelin.games/ecs/change-detection/": {
              tf: 1.4142135623730951,
            },
            "https://javelin.games/ecs/entities/": { tf: 1.0 },
            "https://javelin.games/ecs/performance/": { tf: 1.0 },
          },
          df: 3,
          ".": {
            docs: {},
            df: 0,
            7: {
              docs: {},
              df: 0,
              9: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          9: {
            docs: {},
            df: 0,
            0: {
              docs: {},
              df: 0,
              0: {
                docs: {},
                df: 0,
                x: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          x: {
            docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
            df: 1,
          },
        },
        4: {
          docs: {
            "https://javelin.games/ecs/performance/": {
              tf: 1.4142135623730951,
            },
          },
          df: 1,
          2: {
            docs: {},
            df: 0,
            4: {
              docs: {},
              df: 0,
              ".": {
                docs: {},
                df: 0,
                4: {
                  docs: {},
                  df: 0,
                  8: {
                    docs: {},
                    df: 0,
                    7: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          m: {
            docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
            df: 1,
          },
        },
        6: {
          docs: {},
          df: 0,
          0: {
            docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
            df: 1,
            h: {
              docs: {},
              df: 0,
              z: {
                docs: {
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 2,
              },
            },
          },
        },
        8: {
          docs: {},
          df: 0,
          5: {
            docs: {},
            df: 0,
            5: {
              docs: {},
              df: 0,
              0: {
                docs: {},
                df: 0,
                0: {
                  docs: {},
                  df: 0,
                  0: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
        },
        9: {
          docs: {},
          df: 0,
          9: {
            docs: {},
            df: 0,
            7: {
              docs: {},
              df: 0,
              5: {
                docs: {},
                df: 0,
                0: {
                  docs: {},
                  df: 0,
                  0: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                    0: {
                      docs: {},
                      df: 0,
                      0: {
                        docs: {},
                        df: 0,
                        0: {
                          docs: {
                            "https://javelin.games/ecs/performance/": {
                              tf: 1.0,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        _: {
          docs: {},
          df: 0,
          t: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/components/": {
                    tf: 2.6457513110645907,
                  },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 2,
              },
            },
          },
        },
        a: {
          docs: {},
          df: 0,
          ".": {
            docs: {},
            df: 0,
            v: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          b: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              v: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            s: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          c: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 6,
                  },
                },
                s: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/performance/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 2,
                  },
                },
              },
            },
            t: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
              i: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 2,
                  },
                },
                v: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
              },
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          d: {
            docs: {
              "https://javelin.games/ecs/events/": { tf: 1.0 },
              "https://javelin.games/ecs/topics/": { tf: 1.0 },
              "https://javelin.games/ecs/world/": { tf: 1.0 },
            },
            df: 3,
            d: {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.0 },
                "https://javelin.games/ecs/effects/": { tf: 1.0 },
              },
              df: 2,
              "(": {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          f: {
            docs: {},
            df: 0,
            f: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          g: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          i: {
            docs: {
              "https://javelin.games/ecs/systems/": { tf: 1.4142135623730951 },
            },
            df: 1,
            m: {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.0 },
                "https://javelin.games/ecs/performance/": { tf: 1.0 },
              },
              df: 2,
            },
          },
          l: {
            docs: {},
            df: 0,
            g: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {},
                        df: 0,
                        m: {
                          docs: {
                            "https://javelin.games/ecs/change-detection/": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                c: {
                  docs: {
                    "https://javelin.games/ecs/performance/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
                w: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                g: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                  s: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    g: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          "https://javelin.games/ecs/entities/": { tf: 1.0 },
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
              },
            },
            w: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                y: {
                  docs: {
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            d: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
            },
            o: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              ";": {
                docs: {},
                df: 0,
                "&": {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                h: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            i: {
              docs: {
                "https://javelin.games/ecs/effects/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/events/": { tf: 1.0 },
                "https://javelin.games/ecs/topics/": { tf: 1.0 },
              },
              df: 3,
            },
            p: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
              r: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {
                          "https://javelin.games/ecs/performance/": {
                            tf: 1.4142135623730951,
                          },
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            b: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            c: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    y: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {
                          "https://javelin.games/ecs/entities/": { tf: 2.0 },
                          "https://javelin.games/ecs/performance/": {
                            tf: 2.449489742783178,
                          },
                          "https://javelin.games/ecs/systems/": {
                            tf: 1.7320508075688772,
                          },
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                          "https://javelin.games/ecs/world/": { tf: 1.0 },
                        },
                        df: 5,
                        e: {
                          docs: {},
                          df: 0,
                          ".": {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {
                                "https://javelin.games/ecs/performance/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {
                                "https://javelin.games/ecs/": { tf: 1.0 },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                t: {
                  docs: {},
                  df: 0,
                  y: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                "'": {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            g: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                },
                df: 1,
              },
            },
            o: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              g: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
            },
            r: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                y: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/performance/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 7,
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          s: {
            docs: {},
            df: 0,
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                m: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            y: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 4,
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              o: {
                docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                df: 1,
                m: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/components/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 4,
                    },
                  },
                },
              },
            },
          },
          v: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 2,
                },
              },
            },
            g: {
              docs: {},
              df: 0,
              _: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      k: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          w: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              y: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
        },
        b: {
          docs: {
            "https://javelin.games/ecs/effects/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/performance/": {
              tf: 1.4142135623730951,
            },
            "https://javelin.games/ecs/systems/": { tf: 1.4142135623730951 },
          },
          df: 3,
          ".": {
            docs: {},
            df: 0,
            v: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          a: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              k: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
              },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 2,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          e: {
            docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
            df: 1,
            g: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                v: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/": {
                            tf: 2.23606797749979,
                          },
                          "https://javelin.games/ecs/components/": { tf: 1.0 },
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 4,
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                w: {
                  docs: {
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 6,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        k: {
                          docs: {
                            "https://javelin.games/ecs/performance/": {
                              tf: 1.0,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              t: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
            t: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 7,
                    },
                  },
                },
              },
            },
            y: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            g: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                      ".": {
                        docs: {},
                        df: 0,
                        v: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              u: {
                                docs: {
                                  "https://javelin.games/ecs/effects/": {
                                    tf: 1.4142135623730951,
                                  },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            t: {
              docs: {
                "https://javelin.games/ecs/events/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": { tf: 1.0 },
              },
              df: 2,
            },
          },
          o: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              i: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 4.358898943540674 },
                  "https://javelin.games/ecs/effects/": { tf: 2.0 },
                  "https://javelin.games/ecs/events/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/topics/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 4,
              },
              y: {
                docs: {},
                df: 0,
                "[": {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            y: {
                              docs: {},
                              df: 0,
                              "]": {
                                docs: {},
                                df: 0,
                                ".": {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {
                                      "https://javelin.games/ecs/": { tf: 1.0 },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              h: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                v: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            f: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            g: {
              docs: {
                "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
              },
              df: 1,
            },
            i: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/introduction/": { tf: 1.0 },
                    "https://javelin.games/introduction/installation/": {
                      tf: 2.0,
                    },
                  },
                  df: 5,
                },
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 1,
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              n: {
                docs: {
                  "https://javelin.games/ecs/world/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 1,
                ".": {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            p: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        k: {
                                          docs: {
                                            "https://javelin.games/ecs/world/":
                                              {
                                                tf: 1.0,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          y: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
        },
        c: {
          docs: {},
          df: 0,
          "/": {
            docs: {},
            df: 0,
            c: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
            },
          },
          a: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 2.0 },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/events/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 8,
                b: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      k: {
                        docs: {
                          "https://javelin.games/ecs/effects/": {
                            tf: 1.4142135623730951,
                          },
                          "https://javelin.games/ecs/events/": { tf: 1.0 },
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              d: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 1,
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          h: {
                            docs: {
                              "https://javelin.games/ecs/components/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              s: {
                docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                df: 1,
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          d: {
            docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
            df: 1,
          },
          h: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      g: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                g: {
                  docs: {
                    "https://javelin.games/ecs/change-detection/": {
                      tf: 3.3166247903554,
                    },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/entities/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/events/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 5,
                },
                n: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              d: {
                                docs: {},
                                df: 0,
                                "(": {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      p: {
                                        docs: {},
                                        df: 0,
                                        u: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {
                                              "https://javelin.games/ecs/effects/":
                                                {
                                                  tf: 1.0,
                                                },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                        "https://javelin.games/introduction/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                k: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/introduction/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                s: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                l: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                  e: {
                    docs: {},
                    df: 0,
                    ".": {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              u: {
                                docs: {
                                  "https://javelin.games/ecs/effects/": {
                                    tf: 1.4142135623730951,
                                  },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                s: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 2.23606797749979 },
                  },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                  u: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
                r: {
                  docs: {
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/ecs/performance/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
              s: {
                docs: {},
                df: 0,
                e: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
                u: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.7320508075688772,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/introduction/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/introduction/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              e: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
              m: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 1,
                      "[": {
                        docs: {},
                        df: 0,
                        0: {
                          docs: {
                            "https://javelin.games/ecs/topics/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                        2: {
                          docs: {
                            "https://javelin.games/ecs/topics/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                    j: {
                      docs: {
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 1,
                    },
                  },
                },
                u: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
                l: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                    },
                    x: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 4.0 },
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 2.8284271247461903,
                      },
                      "https://javelin.games/ecs/components/": {
                        tf: 5.291502622129181,
                      },
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/entities/": { tf: 3.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 3.605551275463989,
                      },
                      "https://javelin.games/ecs/performance/": { tf: 3.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 3.872983346207417,
                      },
                      "https://javelin.games/ecs/topics/": {
                        tf: 2.23606797749979,
                      },
                      "https://javelin.games/ecs/world/": {
                        tf: 3.3166247903554,
                      },
                      "https://javelin.games/introduction/": { tf: 1.0 },
                    },
                    df: 11,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  s: {
                                    docs: {
                                      "https://javelin.games/ecs/components/": {
                                        tf: 1.4142135623730951,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  s: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/": {
                            tf: 1.7320508075688772,
                          },
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                  r: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
              d: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 2,
                    i: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              f: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 2,
                    u: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/components/": { tf: 1.0 },
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
                u: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 2.0 } },
                    df: 1,
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            g: {
                              docs: {},
                              df: 0,
                              "(": {
                                docs: {},
                                df: 0,
                                '"': {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {
                                      "https://javelin.games/ecs/effects/": {
                                        tf: 1.0,
                                      },
                                    },
                                    df: 1,
                                  },
                                  b: {
                                    docs: {
                                      "https://javelin.games/ecs/effects/": {
                                        tf: 1.0,
                                      },
                                    },
                                    df: 1,
                                  },
                                  t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        k: {
                                          docs: {
                                            "https://javelin.games/ecs/world/":
                                              {
                                                tf: 1.0,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                    o: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        k: {
                                          docs: {
                                            "https://javelin.games/ecs/world/":
                                              {
                                                tf: 1.0,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                  },
                                },
                                a: {
                                  docs: {},
                                  df: 0,
                                  ".": {
                                    docs: {},
                                    df: 0,
                                    v: {
                                      docs: {},
                                      df: 0,
                                      a: {
                                        docs: {},
                                        df: 0,
                                        l: {
                                          docs: {},
                                          df: 0,
                                          u: {
                                            docs: {
                                              "https://javelin.games/ecs/effects/":
                                                {
                                                  tf: 1.0,
                                                },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                                w: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                      docs: {},
                                      df: 0,
                                      l: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                          docs: {},
                                          df: 0,
                                          ".": {
                                            docs: {},
                                            df: 0,
                                            s: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  t: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                      docs: {},
                                                      df: 0,
                                                      ".": {
                                                        docs: {},
                                                        df: 0,
                                                        c: {
                                                          docs: {},
                                                          df: 0,
                                                          u: {
                                                            docs: {},
                                                            df: 0,
                                                            r: {
                                                              docs: {},
                                                              df: 0,
                                                              r: {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  n: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    t: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      t: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        i: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          c: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            k: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              d: {
                                                                                docs: {},
                                                                                df: 0,
                                                                                a: {
                                                                                  docs: {},
                                                                                  df: 0,
                                                                                  t: {
                                                                                    docs: {},
                                                                                    df: 0,
                                                                                    a: {
                                                                                      docs: {
                                                                                        "https://javelin.games/ecs/systems/":
                                                                                          {
                                                                                            tf: 1.0,
                                                                                          },
                                                                                      },
                                                                                      df: 1,
                                                                                    },
                                                                                  },
                                                                                },
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                t: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/change-detection/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/components/": { tf: 3.0 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 4.58257569495584,
                    },
                    "https://javelin.games/ecs/entities/": { tf: 2.0 },
                    "https://javelin.games/ecs/events/": { tf: 2.0 },
                    "https://javelin.games/ecs/systems/": {
                      tf: 3.605551275463989,
                    },
                    "https://javelin.games/ecs/topics/": {
                      tf: 2.8284271247461903,
                    },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 10,
                  r: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              "(": {
                                docs: {},
                                df: 0,
                                b: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {},
                                      df: 0,
                                      i: {
                                        docs: {
                                          "https://javelin.games/ecs/": {
                                            tf: 1.0,
                                          },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                  },
                },
                e: {
                  docs: {},
                  df: 0,
                  x: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 2.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 3,
                    },
                  },
                },
              },
              v: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              i: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
              },
            },
            r: {
              docs: {},
              df: 0,
              a: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
              e: {
                docs: {
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/introduction/": { tf: 1.0 },
                },
                df: 2,
              },
              n: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          n: {
                            docs: {
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {
                              "https://javelin.games/ecs/events/": { tf: 1.0 },
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 2,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                t: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
              p: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
              r: {
                docs: {},
                df: 0,
                s: {
                  docs: {
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 1,
                },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            u: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
            },
          },
          r: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/components/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/entities/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/events/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 8,
                  e: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        m: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {},
                                        df: 0,
                                        y: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {
                                              "https://javelin.games/ecs/components/":
                                                {
                                                  tf: 2.0,
                                                },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    e: {
                      docs: {},
                      df: 0,
                      f: {
                        docs: {},
                        df: 0,
                        f: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            c: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {
                                  "https://javelin.games/ecs/effects/": {
                                    tf: 1.4142135623730951,
                                  },
                                },
                                df: 1,
                                "(": {
                                  docs: {},
                                  df: 0,
                                  w: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      r: {
                                        docs: {},
                                        df: 0,
                                        l: {
                                          docs: {},
                                          df: 0,
                                          d: {
                                            docs: {
                                              "https://javelin.games/ecs/effects/":
                                                {
                                                  tf: 1.4142135623730951,
                                                },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    t: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {
                            "https://javelin.games/ecs/topics/": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 1,
                          i: {
                            docs: {},
                            df: 0,
                            c: {
                              docs: {},
                              df: 0,
                              "&": {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    ";": {
                                      docs: {},
                                      df: 0,
                                      i: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            u: {
                                              docs: {},
                                              df: 0,
                                              l: {
                                                docs: {},
                                                df: 0,
                                                s: {
                                                  docs: {},
                                                  df: 0,
                                                  e: {
                                                    docs: {},
                                                    df: 0,
                                                    c: {
                                                      docs: {},
                                                      df: 0,
                                                      o: {
                                                        docs: {},
                                                        df: 0,
                                                        m: {
                                                          docs: {},
                                                          df: 0,
                                                          m: {
                                                            docs: {},
                                                            df: 0,
                                                            a: {
                                                              docs: {},
                                                              df: 0,
                                                              n: {
                                                                docs: {},
                                                                df: 0,
                                                                d: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  "&": {
                                                                    docs: {},
                                                                    df: 0,
                                                                    g: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      t: {
                                                                        docs: {
                                                                          "https://javelin.games/ecs/topics/":
                                                                            {
                                                                              tf: 1.0,
                                                                            },
                                                                        },
                                                                        df: 1,
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                      t: {
                                        docs: {},
                                        df: 0,
                                        "&": {
                                          docs: {},
                                          df: 0,
                                          g: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {
                                                "https://javelin.games/ecs/topics/":
                                                  {
                                                    tf: 1.0,
                                                  },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    w: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          l: {
                            docs: {},
                            df: 0,
                            d: {
                              docs: {
                                "https://javelin.games/ecs/components/": {
                                  tf: 1.4142135623730951,
                                },
                                "https://javelin.games/ecs/systems/": {
                                  tf: 1.4142135623730951,
                                },
                                "https://javelin.games/ecs/topics/": {
                                  tf: 1.0,
                                },
                                "https://javelin.games/ecs/world/": {
                                  tf: 2.23606797749979,
                                },
                              },
                              df: 4,
                              "&": {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    ";": {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        u: {
                                          docs: {},
                                          df: 0,
                                          m: {
                                            docs: {},
                                            df: 0,
                                            b: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  "&": {
                                                    docs: {},
                                                    df: 0,
                                                    g: {
                                                      docs: {},
                                                      df: 0,
                                                      t: {
                                                        docs: {
                                                          "https://javelin.games/ecs/systems/":
                                                            {
                                                              tf: 1.0,
                                                            },
                                                        },
                                                        df: 1,
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "https://javelin.games/ecs/components/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {
                          "https://javelin.games/ecs/events/": {
                            tf: 1.4142135623730951,
                          },
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          "https://javelin.games/ecs/world/": { tf: 1.0 },
                        },
                        df: 3,
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 5,
                      t: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {
                              "https://javelin.games/ecs/systems/": {
                                tf: 1.7320508075688772,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        d: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                g: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 2.23606797749979 },
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/components/": {
                    tf: 2.23606797749979,
                  },
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 7,
              },
              e: {
                docs: {},
                df: 0,
                ".": {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      w: {
                        docs: {
                          "https://javelin.games/ecs/systems/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            b: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                g: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            f: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                        "https://javelin.games/ecs/components/": {
                          tf: 2.8284271247461903,
                        },
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 3,
                      v: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          l: {
                            docs: {},
                            df: 0,
                            u: {
                              docs: {
                                "https://javelin.games/ecs/components/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                  df: 1,
                },
              },
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    "https://javelin.games/ecs/components/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/entities/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 6,
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                a: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/effects/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                v: {
                  docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    b: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    y: {
                      docs: {
                        "https://javelin.games/ecs/entities/": { tf: 2.0 },
                        "https://javelin.games/ecs/events/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": { tf: 2.0 },
                    },
                    df: 4,
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 2.23606797749979,
                      },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "https://javelin.games/ecs/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            f: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/": { tf: 1.0 },
                            "https://javelin.games/ecs/change-detection/": {
                              tf: 1.0,
                            },
                            "https://javelin.games/ecs/world/": { tf: 1.0 },
                          },
                          df: 3,
                        },
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                    l: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          "https://javelin.games/introduction/installation/": {
                            tf: 1.0,
                          },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
                u: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {
                          "https://javelin.games/ecs/events/": { tf: 2.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                "/": {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    j: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        "/": {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              d: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  x: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      j: {
                                        docs: {
                                          "https://javelin.games/introduction/installation/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  e: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {},
                        df: 0,
                        "/": {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              d: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  x: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      j: {
                                        docs: {
                                          "https://javelin.games/introduction/installation/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  j: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          l: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {
                                  "https://javelin.games/introduction/installation/":
                                    {
                                      tf: 1.0,
                                    },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          o: {
            docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
            df: 1,
            c: {
              docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
              df: 1,
            },
            e: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  "'": {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              x: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          v: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  m: {
                                    docs: {},
                                    df: 0,
                                    p: {
                                      docs: {},
                                      df: 0,
                                      u: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                          docs: {
                                            "https://javelin.games/ecs/effects/":
                                              {
                                                tf: 1.4142135623730951,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              "'": {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
              e: {
                docs: {
                  "https://javelin.games/ecs/effects/": { tf: 2.0 },
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                },
                df: 2,
              },
            },
            w: {
              docs: {},
              df: 0,
              n: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              w: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
                "(": {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              s: {
                                docs: {},
                                df: 0,
                                ".": {
                                  docs: {},
                                  df: 0,
                                  p: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                      docs: {},
                                      df: 0,
                                      a: {
                                        docs: {},
                                        df: 0,
                                        y: {
                                          docs: {
                                            "https://javelin.games/ecs/systems/":
                                              {
                                                tf: 1.0,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              v: {
                docs: {},
                df: 0,
                e: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            e: {
              docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
              df: 1,
            },
            r: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 2.23606797749979,
                    },
                  },
                  df: 1,
                },
              },
              e: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 3,
              },
            },
          },
        },
        e: {
          docs: {},
          df: 0,
          ".": {
            docs: {},
            df: 0,
            g: {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                "https://javelin.games/ecs/performance/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/topics/": { tf: 1.0 },
              },
              df: 4,
            },
          },
          a: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              h: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 2.0 },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 3.0 },
                  "https://javelin.games/ecs/world/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 7,
                o: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    h: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              i: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                },
                df: 2,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.7320508075688772,
                      },
                    },
                    df: 3,
                  },
                },
              },
            },
          },
          c: {
            docs: {
              "https://javelin.games/ecs/": { tf: 3.605551275463989 },
              "https://javelin.games/ecs/effects/": { tf: 2.0 },
              "https://javelin.games/ecs/events/": { tf: 1.4142135623730951 },
              "https://javelin.games/ecs/performance/": {
                tf: 2.6457513110645907,
              },
              "https://javelin.games/ecs/systems/": { tf: 1.0 },
              "https://javelin.games/ecs/topics/": { tf: 1.0 },
              "https://javelin.games/ecs/world/": { tf: 1.4142135623730951 },
              "https://javelin.games/introduction/": { tf: 1.4142135623730951 },
              "https://javelin.games/introduction/installation/": { tf: 1.0 },
            },
            df: 9,
            m: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "https://javelin.games/introduction/installation/":
                                {
                                  tf: 1.0,
                                },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              ".": {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            ".": {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      j: {
                                        docs: {
                                          "https://javelin.games/introduction/installation/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                        s: {
                                          docs: {},
                                          df: 0,
                                          '"': {
                                            docs: {},
                                            df: 0,
                                            "&": {
                                              docs: {},
                                              df: 0,
                                              g: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                  docs: {},
                                                  df: 0,
                                                  ";": {
                                                    docs: {},
                                                    df: 0,
                                                    "&": {
                                                      docs: {},
                                                      df: 0,
                                                      l: {
                                                        docs: {},
                                                        df: 0,
                                                        t: {
                                                          docs: {},
                                                          df: 0,
                                                          ";": {
                                                            docs: {},
                                                            df: 0,
                                                            "/": {
                                                              docs: {},
                                                              df: 0,
                                                              s: {
                                                                docs: {},
                                                                df: 0,
                                                                c: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  r: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    i: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      p: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        t: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          "&": {
                                                                            docs: {},
                                                                            df: 0,
                                                                            g: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              t: {
                                                                                docs: {
                                                                                  "https://javelin.games/introduction/installation/":
                                                                                    {
                                                                                      tf: 1.0,
                                                                                    },
                                                                                },
                                                                                df: 1,
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          f: {
            docs: {},
            df: 0,
            f: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        h: {
                          docs: {
                            "https://javelin.games/ecs/events/": { tf: 2.0 },
                          },
                          df: 1,
                          "(": {
                            docs: {},
                            df: 0,
                            b: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  y: {
                                    docs: {},
                                    df: 0,
                                    ")": {
                                      docs: {},
                                      df: 0,
                                      ".": {
                                        docs: {},
                                        df: 0,
                                        f: {
                                          docs: {},
                                          df: 0,
                                          o: {
                                            docs: {},
                                            df: 0,
                                            r: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  c: {
                                                    docs: {},
                                                    df: 0,
                                                    h: {
                                                      docs: {},
                                                      df: 0,
                                                      "(": {
                                                        docs: {},
                                                        df: 0,
                                                        "(": {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            n: {
                                                              docs: {},
                                                              df: 0,
                                                              t: {
                                                                docs: {
                                                                  "https://javelin.games/ecs/events/":
                                                                    {
                                                                      tf: 1.0,
                                                                    },
                                                                },
                                                                df: 1,
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        h: {
                          docs: {
                            "https://javelin.games/ecs/events/": {
                              tf: 1.7320508075688772,
                            },
                          },
                          df: 1,
                          "(": {
                            docs: {},
                            df: 0,
                            b: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  y: {
                                    docs: {},
                                    df: 0,
                                    ")": {
                                      docs: {},
                                      df: 0,
                                      ".": {
                                        docs: {},
                                        df: 0,
                                        f: {
                                          docs: {},
                                          df: 0,
                                          o: {
                                            docs: {},
                                            df: 0,
                                            r: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  c: {
                                                    docs: {},
                                                    df: 0,
                                                    h: {
                                                      docs: {},
                                                      df: 0,
                                                      "(": {
                                                        docs: {},
                                                        df: 0,
                                                        "(": {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            n: {
                                                              docs: {},
                                                              df: 0,
                                                              t: {
                                                                docs: {
                                                                  "https://javelin.games/ecs/events/":
                                                                    {
                                                                      tf: 1.0,
                                                                    },
                                                                },
                                                                df: 1,
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 6.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 3,
                    s: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        c: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              v: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {
                                    "https://javelin.games/ecs/effects/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                        f: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                h: {
                                  docs: {},
                                  df: 0,
                                  "(": {
                                    docs: {},
                                    df: 0,
                                    '"': {
                                      docs: {},
                                      df: 0,
                                      "/": {
                                        docs: {},
                                        df: 0,
                                        q: {
                                          docs: {},
                                          df: 0,
                                          u: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                              docs: {},
                                              df: 0,
                                              s: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                  docs: {},
                                                  df: 0,
                                                  s: {
                                                    docs: {},
                                                    df: 0,
                                                    "?": {
                                                      docs: {},
                                                      df: 0,
                                                      c: {
                                                        docs: {},
                                                        df: 0,
                                                        o: {
                                                          docs: {},
                                                          df: 0,
                                                          m: {
                                                            docs: {},
                                                            df: 0,
                                                            p: {
                                                              docs: {},
                                                              df: 0,
                                                              l: {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  t: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    e: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      "=": {
                                                                        docs: {},
                                                                        df: 0,
                                                                        f: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          a: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            l: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              s: {
                                                                                docs: {
                                                                                  "https://javelin.games/ecs/effects/":
                                                                                    {
                                                                                      tf: 1.0,
                                                                                    },
                                                                                },
                                                                                df: 1,
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        r: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            f: {
                              docs: {},
                              df: 0,
                              "(": {
                                docs: {},
                                df: 0,
                                0: {
                                  docs: {
                                    "https://javelin.games/ecs/effects/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                                1: {
                                  docs: {
                                    "https://javelin.games/ecs/effects/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                        w: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              k: {
                                docs: {
                                  "https://javelin.games/ecs/effects/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/events/": {
                              tf: 1.7320508075688772,
                            },
                          },
                          df: 1,
                          "'": {
                            docs: {
                              "https://javelin.games/ecs/events/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                          "(": {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    k: {
                                      docs: {},
                                      df: 0,
                                      y: {
                                        docs: {},
                                        df: 0,
                                        ")": {
                                          docs: {},
                                          df: 0,
                                          ".": {
                                            docs: {},
                                            df: 0,
                                            f: {
                                              docs: {},
                                              df: 0,
                                              o: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  e: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                      docs: {},
                                                      df: 0,
                                                      c: {
                                                        docs: {},
                                                        df: 0,
                                                        h: {
                                                          docs: {},
                                                          df: 0,
                                                          "(": {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              n: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/events/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  t: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        v: {
                          docs: {
                            "https://javelin.games/ecs/effects/": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 1,
                          a: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              "(": {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  u: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                      docs: {
                                        "https://javelin.games/ecs/effects/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                                i: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    p: {
                                      docs: {},
                                      df: 0,
                                      u: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                          docs: {},
                                          df: 0,
                                          _: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                  docs: {},
                                                  df: 0,
                                                  d: {
                                                    docs: {},
                                                    df: 0,
                                                    _: {
                                                      docs: {},
                                                      df: 0,
                                                      f: {
                                                        docs: {},
                                                        df: 0,
                                                        r: {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            q: {
                                                              docs: {},
                                                              df: 0,
                                                              u: {
                                                                docs: {
                                                                  "https://javelin.games/ecs/effects/":
                                                                    {
                                                                      tf: 1.0,
                                                                    },
                                                                },
                                                                df: 1,
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              j: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 1,
                      "&": {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            ";": {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                "&": {
                                  docs: {},
                                  df: 0,
                                  g: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {},
                                      df: 0,
                                      ";": {
                                        docs: {},
                                        df: 0,
                                        "(": {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {},
                                                df: 0,
                                                h: {
                                                  docs: {
                                                    "https://javelin.games/ecs/effects/":
                                                      {
                                                        tf: 1.0,
                                                      },
                                                  },
                                                  df: 1,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  f: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                    "&": {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          ";": {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              u: {
                                docs: {},
                                df: 0,
                                m: {
                                  docs: {},
                                  df: 0,
                                  b: {
                                    docs: {
                                      "https://javelin.games/ecs/effects/": {
                                        tf: 1.0,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                            t: {
                              docs: {},
                              df: 0,
                              "&": {
                                docs: {},
                                df: 0,
                                g: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    ";": {
                                      docs: {},
                                      df: 0,
                                      "(": {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          n: {
                                            docs: {},
                                            df: 0,
                                            i: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                  docs: {},
                                                  df: 0,
                                                  a: {
                                                    docs: {},
                                                    df: 0,
                                                    l: {
                                                      docs: {},
                                                      df: 0,
                                                      v: {
                                                        docs: {},
                                                        df: 0,
                                                        a: {
                                                          docs: {},
                                                          df: 0,
                                                          l: {
                                                            docs: {},
                                                            df: 0,
                                                            u: {
                                                              docs: {
                                                                "https://javelin.games/ecs/effects/":
                                                                  {
                                                                    tf: 1.0,
                                                                  },
                                                              },
                                                              df: 1,
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  m: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {
                          "https://javelin.games/ecs/events/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                        e: {
                          docs: {},
                          df: 0,
                          "(": {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    k: {
                                      docs: {},
                                      df: 0,
                                      y: {
                                        docs: {},
                                        df: 0,
                                        ")": {
                                          docs: {},
                                          df: 0,
                                          ".": {
                                            docs: {},
                                            df: 0,
                                            f: {
                                              docs: {},
                                              df: 0,
                                              o: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  e: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                      docs: {},
                                                      df: 0,
                                                      c: {
                                                        docs: {},
                                                        df: 0,
                                                        h: {
                                                          docs: {},
                                                          df: 0,
                                                          "(": {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              n: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/events/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.7320508075688772,
                      },
                    },
                    df: 1,
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                    e: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        "(": {
                          docs: {},
                          df: 0,
                          1: {
                            docs: {},
                            df: 0,
                            0: {
                              docs: {},
                              df: 0,
                              0: {
                                docs: {},
                                df: 0,
                                0: {
                                  docs: {
                                    "https://javelin.games/ecs/effects/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                          2: {
                            docs: {},
                            df: 0,
                            0: {
                              docs: {},
                              df: 0,
                              0: {
                                docs: {},
                                df: 0,
                                0: {
                                  docs: {
                                    "https://javelin.games/ecs/effects/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                s: {
                  docs: {
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              g: {
                docs: {
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 2,
              },
            },
            r: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            c: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            d: {
              docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
              df: 1,
            },
            e: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                i: {
                  docs: {
                    "https://javelin.games/ecs/events/": {
                      tf: 3.4641016151377544,
                    },
                  },
                  df: 1,
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            q: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
              i: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 3.1622776601683795 },
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 5.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 4.358898943540674,
                      },
                      "https://javelin.games/ecs/performance/": {
                        tf: 2.449489742783178,
                      },
                      "https://javelin.games/ecs/systems/": {
                        tf: 3.1622776601683795,
                      },
                      "https://javelin.games/ecs/topics/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/world/": { tf: 3.0 },
                      "https://javelin.games/introduction/": { tf: 1.0 },
                    },
                    df: 11,
                    e: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        ".": {
                          docs: {},
                          df: 0,
                          l: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                g: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    h: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        "/": {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                k: {
                                  docs: {
                                    "https://javelin.games/ecs/performance/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    t: {
                      docs: {
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                  y: {
                    docs: {},
                    df: 0,
                    "'": {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          s: {
            docs: {
              "https://javelin.games/introduction/installation/": {
                tf: 1.4142135623730951,
              },
            },
            df: 1,
            m: {
              docs: {
                "https://javelin.games/introduction/installation/": { tf: 1.0 },
              },
              df: 1,
            },
            p: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        h: {
                          docs: {
                            "https://javelin.games/ecs/components/": {
                              tf: 1.0,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            c: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
          },
          v: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              n: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                },
                df: 1,
                t: {
                  docs: {
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 5,
                  u: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          x: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
              m: {
                docs: {},
                df: 0,
                p: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 2.449489742783178 },
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 2.0 },
                      "https://javelin.games/ecs/entities/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/performance/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                      "https://javelin.games/resources/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 11,
                  },
                },
              },
            },
            c: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/events/": {
                        tf: 2.8284271247461903,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 2.449489742783178,
                      },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/world/": {
                        tf: 1.7320508075688772,
                      },
                    },
                    df: 4,
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
                n: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
              l: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
                s: {
                  docs: {
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  ".": {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {
                                  "https://javelin.games/ecs/change-detection/":
                                    {
                                      tf: 1.0,
                                    },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        f: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              s: {
                docs: {
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 2,
              },
            },
            m: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/world/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            w: {
              docs: {
                "https://javelin.games/ecs/effects/": {
                  tf: 1.4142135623730951,
                },
              },
              df: 1,
            },
          },
          i: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/components/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
            },
            f: {
              docs: {},
              df: 0,
              o: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
            },
            n: {
              docs: {},
              df: 0,
              d: {
                docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                df: 1,
              },
              e: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
              i: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 3,
                },
              },
            },
            t: {
              docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
              df: 1,
            },
          },
          l: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              p: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            u: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                h: {
                  docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/components/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 10,
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              ".": {
                docs: {},
                df: 0,
                ".": {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    f: {
                      docs: {
                        "https://javelin.games/ecs/events/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
              c: {
                docs: {
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 2,
              },
              e: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    h: {
                      docs: {
                        "https://javelin.games/ecs/events/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 2,
                    },
                  },
                },
              },
              g: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
              w: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
            },
          },
          p: {
            docs: {
              "https://javelin.games/ecs/": { tf: 1.0 },
              "https://javelin.games/resources/": { tf: 1.0 },
            },
            df: 2,
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              y: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
            e: {
              docs: {},
              df: 0,
              q: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                      t: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "https://javelin.games/ecs/": { tf: 1.0 },
                          "https://javelin.games/ecs/components/": { tf: 1.0 },
                          "https://javelin.games/ecs/effects/": {
                            tf: 1.7320508075688772,
                          },
                          "https://javelin.games/ecs/events/": {
                            tf: 1.4142135623730951,
                          },
                          "https://javelin.games/ecs/systems/": {
                            tf: 1.7320508075688772,
                          },
                          "https://javelin.games/ecs/topics/": {
                            tf: 1.4142135623730951,
                          },
                          "https://javelin.games/ecs/world/": { tf: 1.0 },
                        },
                        df: 7,
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
          },
        },
        g: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              n: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
            },
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 3.7416573867739413 },
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/components/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 3.0 },
                  "https://javelin.games/ecs/topics/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/introduction/": { tf: 1.0 },
                },
                df: 8,
                "'": {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
                p: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          c: {
            docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
            df: 1,
          },
          e: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    y: {
                      docs: {},
                      df: 0,
                      b: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    y: {
                                      docs: {},
                                      df: 0,
                                      "(": {
                                        docs: {},
                                        df: 0,
                                        c: {
                                          docs: {},
                                          df: 0,
                                          o: {
                                            docs: {},
                                            df: 0,
                                            m: {
                                              docs: {},
                                              df: 0,
                                              m: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  n: {
                                                    docs: {},
                                                    df: 0,
                                                    d: {
                                                      docs: {},
                                                      df: 0,
                                                      "[": {
                                                        docs: {},
                                                        df: 0,
                                                        1: {
                                                          docs: {
                                                            "https://javelin.games/ecs/topics/":
                                                              {
                                                                tf: 1.0,
                                                              },
                                                          },
                                                          df: 1,
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                        e: {
                                          docs: {},
                                          df: 0,
                                          n: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {
                                                "https://javelin.games/ecs/topics/":
                                                  {
                                                    tf: 1.0,
                                                  },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/events/": {
                      tf: 3.605551275463989,
                    },
                  },
                  df: 1,
                },
              },
            },
            z: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
            },
          },
          i: {
            docs: {},
            df: 0,
            t: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
              h: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {
                      "https://javelin.games/introduction/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": {
                        tf: 2.6457513110645907,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 4,
                  },
                },
              },
            },
          },
          o: {
            docs: {
              "https://javelin.games/ecs/": { tf: 1.0 },
              "https://javelin.games/ecs/events/": { tf: 1.0 },
            },
            df: 2,
            a: {
              docs: {},
              df: 0,
              l: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
            d: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                },
                df: 3,
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              w: {
                docs: {
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 2,
                t: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          t: {
            docs: {
              "https://javelin.games/ecs/": { tf: 1.0 },
              "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
              "https://javelin.games/ecs/effects/": { tf: 4.0 },
              "https://javelin.games/ecs/entities/": { tf: 1.4142135623730951 },
              "https://javelin.games/ecs/events/": { tf: 4.47213595499958 },
              "https://javelin.games/ecs/systems/": { tf: 3.872983346207417 },
              "https://javelin.games/ecs/topics/": { tf: 2.449489742783178 },
              "https://javelin.games/ecs/world/": { tf: 1.4142135623730951 },
            },
            df: 8,
          },
          u: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              d: {
                docs: { "https://javelin.games/resources/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
        },
        h: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 3,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {
                      "https://javelin.games/ecs/components/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/entities/": {
                        tf: 3.1622776601683795,
                      },
                      "https://javelin.games/ecs/world/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 3,
                    ".": {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          l: {
                            docs: {},
                            df: 0,
                            u: {
                              docs: {
                                "https://javelin.games/ecs/world/": { tf: 1.0 },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                o: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
              p: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            g: {
              docs: {},
              df: 0,
              h: {
                docs: {
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 2,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            t: {
              docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
              df: 1,
            },
          },
          o: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 3,
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              l: {
                docs: {
                  "https://javelin.games/introduction/installation/": {
                    tf: 1.0,
                  },
                },
                df: 1,
              },
            },
            t: {
              docs: {},
              df: 0,
              p: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
                s: {
                  docs: {},
                  df: 0,
                  ":": {
                    docs: {},
                    df: 0,
                    "/": {
                      docs: {},
                      df: 0,
                      "/": {
                        docs: {},
                        df: 0,
                        g: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              h: {
                                docs: {},
                                df: 0,
                                u: {
                                  docs: {},
                                  df: 0,
                                  b: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                          docs: {},
                                          df: 0,
                                          m: {
                                            docs: {},
                                            df: 0,
                                            "/": {
                                              docs: {},
                                              df: 0,
                                              3: {
                                                docs: {},
                                                df: 0,
                                                m: {
                                                  docs: {},
                                                  df: 0,
                                                  c: {
                                                    docs: {},
                                                    df: 0,
                                                    d: {
                                                      docs: {},
                                                      df: 0,
                                                      "/": {
                                                        docs: {},
                                                        df: 0,
                                                        j: {
                                                          docs: {},
                                                          df: 0,
                                                          a: {
                                                            docs: {},
                                                            df: 0,
                                                            v: {
                                                              docs: {},
                                                              df: 0,
                                                              e: {
                                                                docs: {},
                                                                df: 0,
                                                                l: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  i: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    n: {
                                                                      docs: {
                                                                        "https://javelin.games/ecs/performance/":
                                                                          {
                                                                            tf: 1.0,
                                                                          },
                                                                      },
                                                                      df: 1,
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        i: {
          docs: {},
          df: 0,
          ".": {
            docs: {
              "https://javelin.games/ecs/effects/": { tf: 1.0 },
              "https://javelin.games/ecs/events/": { tf: 1.0 },
            },
            df: 2,
          },
          5: {
            docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
            df: 1,
          },
          d: {
            docs: { "https://javelin.games/ecs/components/": { tf: 1.0 } },
            df: 1,
            e: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
            },
          },
          f: {
            docs: {},
            df: 0,
            "/": {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 2,
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/": {
                              tf: 1.7320508075688772,
                            },
                            "https://javelin.games/ecs/change-detection/": {
                              tf: 1.0,
                            },
                            "https://javelin.games/ecs/performance/": {
                              tf: 1.4142135623730951,
                            },
                            "https://javelin.games/ecs/systems/": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 4,
                        },
                      },
                    },
                  },
                },
                u: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 8,
                  },
                },
                s: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {
                      "https://javelin.games/ecs/topics/": {
                        tf: 3.1622776601683795,
                      },
                    },
                    df: 1,
                    e: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                n: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {
                                      "https://javelin.games/ecs/topics/": {
                                        tf: 1.4142135623730951,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            "/": {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            c: {
              docs: {},
              df: 0,
              h: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
              l: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 2.449489742783178,
                      },
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 5,
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/entities/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            d: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                x: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {
                    "https://javelin.games/ecs/components/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 3,
                  a: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        z: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            "(": {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {
                                          "https://javelin.games/ecs/components/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 3.872983346207417 },
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/entities/": {
                      tf: 2.449489742783178,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 6,
                  "[": {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              y: {
                                docs: {},
                                df: 0,
                                "]": {
                                  docs: {},
                                  df: 0,
                                  ".": {
                                    docs: {},
                                    df: 0,
                                    j: {
                                      docs: {},
                                      df: 0,
                                      u: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {
                                              "https://javelin.games/ecs/": {
                                                tf: 1.0,
                                              },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                  n: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                    t: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "https://javelin.games/ecs/effects/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
                e: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                g: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  },
                  df: 3,
                },
                l: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
                r: {
                  docs: {
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                  a: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/effects/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                  e: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                  f: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                  v: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/introduction/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {
                            "https://javelin.games/ecs/": { tf: 1.0 },
                            "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          },
                          df: 2,
                        },
                      },
                    },
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/world/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          s: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              l: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            "'": {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                "https://javelin.games/ecs/effects/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": { tf: 1.0 },
              },
              df: 4,
            },
            e: {
              docs: {},
              df: 0,
              m: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
              r: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  "https://javelin.games/ecs/events/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/performance/": {
                    tf: 2.8284271247461903,
                  },
                  "https://javelin.games/ecs/systems/": { tf: 3.3166247903554 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 5,
                _: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        k: {
                          docs: {
                            "https://javelin.games/ecs/performance/": {
                              tf: 1.0,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        j: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            v: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "https://javelin.games/ecs/performance/": {
                                tf: 2.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/effects/": { tf: 2.0 },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": {
                          tf: 2.449489742783178,
                        },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/introduction/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/resources/": { tf: 1.0 },
                      },
                      df: 11,
                      "'": {
                        docs: {
                          "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          "https://javelin.games/ecs/events/": { tf: 1.0 },
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 3,
                      },
                      ".": {
                        docs: {},
                        df: 0,
                        c: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    w: {
                                      docs: {},
                                      df: 0,
                                      o: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                          docs: {},
                                          df: 0,
                                          l: {
                                            docs: {},
                                            df: 0,
                                            d: {
                                              docs: {
                                                "https://javelin.games/introduction/installation/":
                                                  {
                                                    tf: 1.0,
                                                  },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      "/": {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {
                              "https://javelin.games/ecs/components/": {
                                tf: 1.0,
                              },
                              "https://javelin.games/ecs/effects/": { tf: 1.0 },
                              "https://javelin.games/ecs/events/": {
                                tf: 1.4142135623730951,
                              },
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                              "https://javelin.games/ecs/topics/": { tf: 1.0 },
                              "https://javelin.games/ecs/world/": { tf: 1.0 },
                              "https://javelin.games/introduction/installation/":
                                {
                                  tf: 1.0,
                                },
                            },
                            df: 7,
                          },
                        },
                        n: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {
                                "https://javelin.games/ecs/change-detection/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          s: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                ".": {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            "(": {
                              docs: {},
                              df: 0,
                              l: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  c: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {},
                                      df: 0,
                                      l: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                              docs: {},
                                              df: 0,
                                              r: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  g: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                      docs: {},
                                                      df: 0,
                                                      ".": {
                                                        docs: {},
                                                        df: 0,
                                                        g: {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                              docs: {},
                                                              df: 0,
                                                              i: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  e: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    m: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      "(": {
                                                                        docs: {},
                                                                        df: 0,
                                                                        '"': {
                                                                          docs: {},
                                                                          df: 0,
                                                                          w: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            o: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              r: {
                                                                                docs: {},
                                                                                df: 0,
                                                                                l: {
                                                                                  docs: {},
                                                                                  df: 0,
                                                                                  d: {
                                                                                    docs: {
                                                                                      "https://javelin.games/ecs/world/":
                                                                                        {
                                                                                          tf: 1.0,
                                                                                        },
                                                                                    },
                                                                                    df: 1,
                                                                                  },
                                                                                },
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          n: {
                            docs: {},
                            df: 0,
                            g: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                f: {
                                  docs: {},
                                  df: 0,
                                  y: {
                                    docs: {},
                                    df: 0,
                                    "(": {
                                      docs: {},
                                      df: 0,
                                      w: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                          docs: {},
                                          df: 0,
                                          r: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                              docs: {},
                                              df: 0,
                                              d: {
                                                docs: {},
                                                df: 0,
                                                ".": {
                                                  docs: {},
                                                  df: 0,
                                                  s: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                      docs: {},
                                                      df: 0,
                                                      a: {
                                                        docs: {},
                                                        df: 0,
                                                        p: {
                                                          docs: {},
                                                          df: 0,
                                                          s: {
                                                            docs: {},
                                                            df: 0,
                                                            h: {
                                                              docs: {},
                                                              df: 0,
                                                              o: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/world/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              p: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 2.449489742783178 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 2,
              },
            },
          },
        },
        k: {
          docs: {},
          df: 0,
          e: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              p: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            y: {
              docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
              df: 1,
              b: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                },
                df: 2,
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              w: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                },
                df: 2,
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
            },
          },
        },
        l: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    g: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "https://javelin.games/ecs/events/": {
                    tf: 2.8284271247461903,
                  },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
              },
            },
            t: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              k: {
                docs: {
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 2,
              },
              r: {
                docs: {},
                df: 0,
                n: {
                  docs: { "https://javelin.games/introduction/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            g: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              s: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
            t: {
              docs: {
                "https://javelin.games/ecs/effects/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/performance/": {
                  tf: 1.4142135623730951,
                },
              },
              df: 2,
              "'": {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            b: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                    y: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              u: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {
                                    "https://javelin.games/ecs/effects/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 2,
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/introduction/installation/": {
                    tf: 1.0,
                  },
                },
                df: 1,
              },
            },
            c: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 2.449489742783178,
                    },
                  },
                  df: 1,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            g: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                ".": {
                                  docs: {},
                                  df: 0,
                                  s: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                              docs: {},
                                              df: 0,
                                              m: {
                                                docs: {},
                                                df: 0,
                                                "(": {
                                                  docs: {},
                                                  df: 0,
                                                  '"': {
                                                    docs: {},
                                                    df: 0,
                                                    w: {
                                                      docs: {},
                                                      df: 0,
                                                      o: {
                                                        docs: {},
                                                        df: 0,
                                                        r: {
                                                          docs: {},
                                                          df: 0,
                                                          l: {
                                                            docs: {},
                                                            df: 0,
                                                            d: {
                                                              docs: {
                                                                "https://javelin.games/ecs/world/":
                                                                  {
                                                                    tf: 1.0,
                                                                  },
                                                              },
                                                              df: 1,
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                t: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
            },
            g: {
              docs: {
                "https://javelin.games/ecs/effects/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": { tf: 1.0 },
              },
              df: 2,
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": {
                      tf: 2.449489742783178,
                    },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/events/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              p: {
                docs: {
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 4,
              },
            },
            w: {
              docs: { "https://javelin.games/ecs/components/": { tf: 1.0 } },
              df: 1,
            },
          },
          t: {
            docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
            df: 1,
            ";": {
              docs: {},
              df: 0,
              "/": {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            "&": {
                              docs: {},
                              df: 0,
                              g: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "https://javelin.games/introduction/installation/":
                                      {
                                        tf: 1.0,
                                      },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/introduction/installation/":
                              {
                                tf: 1.4142135623730951,
                              },
                          },
                          df: 1,
                          "&": {
                            docs: {},
                            df: 0,
                            g: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {
                                  "https://javelin.games/introduction/installation/":
                                    {
                                      tf: 1.4142135623730951,
                                    },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        m: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    k: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            d: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/change-detection/": { tf: 2.0 },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/introduction/installation/": {
                    tf: 1.0,
                  },
                },
                df: 2,
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "https://javelin.games/ecs/systems/": {
                            tf: 1.4142135623730951,
                          },
                          "https://javelin.games/ecs/world/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
            },
            j: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
            k: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                  "https://javelin.games/ecs/components/": { tf: 2.0 },
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 5,
                u: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                g: {
                  docs: {
                    "https://javelin.games/ecs/entities/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 4,
                },
              },
              i: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 2,
                p: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                h: {
                  docs: {
                    "https://javelin.games/ecs/events/": {
                      tf: 2.6457513110645907,
                    },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 2.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 4,
                },
              },
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            x: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            m: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/performance/": {
                        tf: 2.23606797749979,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": {
                        tf: 3.1622776601683795,
                      },
                    },
                    df: 4,
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/entities/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/topics/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/world/": {
                        tf: 1.7320508075688772,
                      },
                    },
                    df: 7,
                    t: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {
                          "https://javelin.games/ecs/world/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            d: {
              docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
              df: 1,
              d: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              d: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
              i: {
                docs: {},
                df: 0,
                f: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
                m: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                  u: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              s: {
                docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 2.0 } },
                df: 1,
                l: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
              i: {
                docs: {},
                df: 0,
                f: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 5,
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/introduction/installation/": {
                      tf: 2.23606797749979,
                    },
                  },
                  df: 1,
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/events/": { tf: 2.0 },
                      },
                      df: 1,
                      "'": {
                        docs: {
                          "https://javelin.games/ecs/events/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 2,
              },
            },
            u: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  "/": {
                    docs: {},
                    df: 0,
                    k: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {},
                          df: 0,
                          b: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {
                                      "https://javelin.games/ecs/systems/": {
                                        tf: 1.0,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/introduction/": { tf: 1.0 },
                },
                df: 3,
                m: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/": { tf: 1.0 },
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 2,
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              h: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
            l: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 3,
                      a: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {
                            "https://javelin.games/introduction/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
        },
        n: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 5,
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/events/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 5,
              },
            },
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            t: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    k: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/networking/": { tf: 1.0 },
                        "https://javelin.games/resources/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            w: {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                "https://javelin.games/ecs/effects/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/world/": { tf: 1.0 },
              },
              df: 3,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: {
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            x: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 3,
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                "'": {
                  docs: {
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 1,
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                f: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            w: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
          },
          p: {
            docs: {},
            df: 0,
            m: {
              docs: {
                "https://javelin.games/introduction/installation/": { tf: 2.0 },
              },
              df: 1,
            },
          },
          u: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/world/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
                "&": {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      ";": {
                        docs: {},
                        df: 0,
                        "(": {
                          docs: {},
                          df: 0,
                          n: {
                            docs: {},
                            df: 0,
                            u: {
                              docs: {},
                              df: 0,
                              l: {
                                docs: {
                                  "https://javelin.games/ecs/effects/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                      "https://javelin.games/ecs/components/": {
                        tf: 2.23606797749979,
                      },
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": {
                        tf: 2.23606797749979,
                      },
                    },
                    df: 5,
                  },
                },
              },
            },
          },
        },
        o: {
          docs: {},
          df: 0,
          b: {
            docs: {},
            df: 0,
            j: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 2.0 },
                      "https://javelin.games/ecs/components/": { tf: 2.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 2.0 },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 8,
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 2.23606797749979,
                      },
                    },
                    df: 1,
                    e: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "https://javelin.games/ecs/change-detection/":
                                      {
                                        tf: 1.0,
                                      },
                                  },
                                  df: 1,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        ".": {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            x: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  a: {
                                                    docs: {},
                                                    df: 0,
                                                    ".": {
                                                      docs: {},
                                                      df: 0,
                                                      a: {
                                                        docs: {},
                                                        df: 0,
                                                        s: {
                                                          docs: {},
                                                          df: 0,
                                                          l: {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              e: {
                                                                docs: {},
                                                                df: 0,
                                                                p: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/change-detection/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                          i: {
                                            docs: {
                                              "https://javelin.games/ecs/change-detection/":
                                                {
                                                  tf: 1.0,
                                                },
                                            },
                                            df: 1,
                                          },
                                          x: {
                                            docs: {
                                              "https://javelin.games/ecs/change-detection/":
                                                {
                                                  tf: 1.0,
                                                },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          c: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            d: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
            },
          },
          n: {
            docs: {
              "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
              "https://javelin.games/ecs/components/": { tf: 1.0 },
              "https://javelin.games/ecs/effects/": { tf: 2.23606797749979 },
              "https://javelin.games/ecs/events/": { tf: 1.4142135623730951 },
              "https://javelin.games/ecs/systems/": { tf: 1.4142135623730951 },
              "https://javelin.games/ecs/topics/": { tf: 1.4142135623730951 },
            },
            df: 6,
            c: {
              docs: {
                "https://javelin.games/ecs/effects/": { tf: 1.0 },
                "https://javelin.games/ecs/events/": { tf: 1.0 },
              },
              df: 2,
            },
            g: {
              docs: {},
              df: 0,
              o: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            t: {
              docs: {},
              df: 0,
              o: {
                docs: { "https://javelin.games/introduction/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            p: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
          },
          p: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              q: {
                docs: {},
                df: 0,
                u: {
                  docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              n: {
                docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                df: 1,
              },
              r: {
                docs: {
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 4,
              },
            },
            p: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                m: {
                  docs: {
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 3,
                },
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 5,
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 6,
                },
              },
            },
            g: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                  i: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          ".": {
                            docs: {},
                            df: 0,
                            f: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        h: {
                                          docs: {},
                                          df: 0,
                                          "(": {
                                            docs: {},
                                            df: 0,
                                            "(": {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                  docs: {},
                                                  df: 0,
                                                  t: {
                                                    docs: {
                                                      "https://javelin.games/ecs/effects/":
                                                        {
                                                          tf: 1.0,
                                                        },
                                                    },
                                                    df: 1,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            t: {
              docs: { "https://javelin.games/introduction/": { tf: 1.0 } },
              df: 1,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          v: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              r: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                },
                df: 3,
                h: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        p: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              k: {
                docs: {
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 1,
                a: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/introduction/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 2,
                    e: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        j: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {
                                  "https://javelin.games/introduction/installation/":
                                    {
                                      tf: 1.4142135623730951,
                                    },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            g: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            i: {
              docs: {},
              df: 0,
              r: {
                docs: {
                  "https://javelin.games/ecs/events/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 1,
              },
            },
            n: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              t: {
                docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                df: 1,
                i: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              s: {
                docs: {
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 2.0 },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 3,
              },
            },
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {
                  "https://javelin.games/introduction/installation/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 1,
              },
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
            r: {
              docs: {
                "https://javelin.games/ecs/effects/": {
                  tf: 1.7320508075688772,
                },
                "https://javelin.games/ecs/performance/": {
                  tf: 1.7320508075688772,
                },
              },
              df: 2,
              f: {
                docs: {
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 1,
                _: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            g: {
                              docs: {
                                "https://javelin.games/ecs/performance/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/performance/": {
                          tf: 2.6457513110645907,
                        },
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.7320508075688772,
                        },
                      },
                      df: 4,
                      a: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {
                                  "https://javelin.games/ecs/change-detection/":
                                    {
                                      tf: 1.0,
                                    },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.7320508075688772,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            y: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 2.0 },
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      "https://javelin.games/ecs/topics/": { tf: 2.0 },
                    },
                    df: 4,
                    s: {
                      docs: {},
                      df: 0,
                      _: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            p: {
                              docs: {
                                "https://javelin.games/ecs/topics/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                      e: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          g: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  ".": {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {},
                                      df: 0,
                                      p: {
                                        docs: {},
                                        df: 0,
                                        p: {
                                          docs: {},
                                          df: 0,
                                          l: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                              docs: {},
                                              df: 0,
                                              i: {
                                                docs: {},
                                                df: 0,
                                                m: {
                                                  docs: {},
                                                  df: 0,
                                                  p: {
                                                    docs: {},
                                                    df: 0,
                                                    u: {
                                                      docs: {},
                                                      df: 0,
                                                      l: {
                                                        docs: {},
                                                        df: 0,
                                                        s: {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            l: {
                                                              docs: {},
                                                              df: 0,
                                                              o: {
                                                                docs: {},
                                                                df: 0,
                                                                c: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  a: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    l: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      "(": {
                                                                        docs: {},
                                                                        df: 0,
                                                                        b: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          o: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            d: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              i: {
                                                                                docs: {
                                                                                  "https://javelin.games/ecs/topics/":
                                                                                    {
                                                                                      tf: 1.4142135623730951,
                                                                                    },
                                                                                },
                                                                                df: 1,
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      t: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {
                              "https://javelin.games/ecs/topics/": { tf: 2.0 },
                            },
                            df: 1,
                            i: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                ".": {
                                  docs: {},
                                  df: 0,
                                  p: {
                                    docs: {},
                                    df: 0,
                                    u: {
                                      docs: {},
                                      df: 0,
                                      s: {
                                        docs: {},
                                        df: 0,
                                        h: {
                                          docs: {},
                                          df: 0,
                                          "(": {
                                            docs: {},
                                            df: 0,
                                            m: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                s: {
                                                  docs: {},
                                                  df: 0,
                                                  s: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                      docs: {},
                                                      df: 0,
                                                      g: {
                                                        docs: {
                                                          "https://javelin.games/ecs/topics/":
                                                            {
                                                              tf: 1.0,
                                                            },
                                                        },
                                                        df: 1,
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                          i: {
                                            docs: {},
                                            df: 0,
                                            m: {
                                              docs: {},
                                              df: 0,
                                              m: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                  docs: {},
                                                  df: 0,
                                                  d: {
                                                    docs: {},
                                                    df: 0,
                                                    i: {
                                                      docs: {},
                                                      df: 0,
                                                      a: {
                                                        docs: {},
                                                        df: 0,
                                                        t: {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            "(": {
                                                              docs: {},
                                                              df: 0,
                                                              "[": {
                                                                docs: {},
                                                                df: 0,
                                                                '"': {
                                                                  docs: {},
                                                                  df: 0,
                                                                  i: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    m: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      p: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        u: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          l: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            s: {
                                                                              docs: {
                                                                                "https://javelin.games/ecs/topics/":
                                                                                  {
                                                                                    tf: 1.0,
                                                                                  },
                                                                              },
                                                                              df: 1,
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
              y: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 4.358898943540674 },
                      "https://javelin.games/ecs/entities/": { tf: 3.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 2.6457513110645907,
                      },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 4,
                    "'": {
                      docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                      df: 1,
                    },
                    "(": {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          w: {
                            docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                            df: 1,
                          },
                        },
                      },
                    },
                    ".": {
                      docs: {},
                      df: 0,
                      j: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {},
                            df: 0,
                            p: {
                              docs: {
                                "https://javelin.games/ecs/": { tf: 1.0 },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                      n: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                        },
                      },
                      u: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                            df: 1,
                          },
                        },
                      },
                      v: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          l: {
                            docs: {},
                            df: 0,
                            u: {
                              docs: {
                                "https://javelin.games/ecs/effects/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                    s: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        f: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  c: {
                                    docs: {},
                                    df: 0,
                                    h: {
                                      docs: {},
                                      df: 0,
                                      "(": {
                                        docs: {},
                                        df: 0,
                                        "(": {
                                          docs: {},
                                          df: 0,
                                          e: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "https://javelin.games/ecs/systems/":
                                                    {
                                                      tf: 1.4142135623730951,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      "/": {
                        docs: {},
                        df: 0,
                        $: {
                          docs: {},
                          df: 0,
                          "{": {
                            docs: {},
                            df: 0,
                            p: {
                              docs: {},
                              df: 0,
                              l: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  y: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      r: {
                                        docs: {},
                                        df: 0,
                                        ".": {
                                          docs: {},
                                          df: 0,
                                          v: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              l: {
                                                docs: {},
                                                df: 0,
                                                u: {
                                                  docs: {},
                                                  df: 0,
                                                  e: {
                                                    docs: {},
                                                    df: 0,
                                                    ".": {
                                                      docs: {},
                                                      df: 0,
                                                      i: {
                                                        docs: {},
                                                        df: 0,
                                                        d: {
                                                          docs: {},
                                                          df: 0,
                                                          "}": {
                                                            docs: {},
                                                            df: 0,
                                                            "/": {
                                                              docs: {},
                                                              df: 0,
                                                              i: {
                                                                docs: {},
                                                                df: 0,
                                                                n: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  b: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    o: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      x: {
                                                                        docs: {
                                                                          "https://javelin.games/ecs/effects/":
                                                                            {
                                                                              tf: 1.0,
                                                                            },
                                                                        },
                                                                        df: 1,
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              l: {
                docs: {
                  "https://javelin.games/ecs/components/": {
                    tf: 2.8284271247461903,
                  },
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            s: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": {
                      tf: 2.6457513110645907,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 5,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        ".": {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {
                              "https://javelin.games/ecs/components/": {
                                tf: 1.4142135623730951,
                              },
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 2,
                          },
                          x: {
                            docs: {
                              "https://javelin.games/ecs/components/": {
                                tf: 1.4142135623730951,
                              },
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 2,
                          },
                        },
                        "[": {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            "]": {
                              docs: {},
                              df: 0,
                              ".": {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                                x: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
                s: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                  },
                  df: 1,
                },
              },
              v: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {
                        "https://javelin.games/ecs/change-detection/": {
                          tf: 1.0,
                        },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 3,
                      s: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {
                                "https://javelin.games/ecs/systems/": {
                                  tf: 1.7320508075688772,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              m: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
              v: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                    },
                    df: 1,
                  },
                },
              },
            },
            o: {
              docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
              df: 1,
              b: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
                l: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              c: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {
                        "https://javelin.games/ecs/topics/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 2,
                      o: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {
                            "https://javelin.games/ecs/performance/": {
                              tf: 1.4142135623730951,
                            },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              d: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              j: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        l: {
                          docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {
                          "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              v: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 4,
                  },
                },
              },
              x: {
                docs: {},
                df: 0,
                i: {
                  docs: {
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
          s: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            b: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    h: {
                      docs: {
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
              i: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              h: {
                docs: {
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 2,
                i: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {
                              "https://javelin.games/ecs/topics/": {
                                tf: 1.4142135623730951,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        q: {
          docs: {},
          df: 0,
          u: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                i: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/events/": { tf: 2.0 },
                    "https://javelin.games/ecs/performance/": {
                      tf: 2.23606797749979,
                    },
                    "https://javelin.games/ecs/systems/": { tf: 4.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 6,
                  e: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                c: {
                                  docs: {},
                                  df: 0,
                                  h: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      d: {
                                        docs: {},
                                        df: 0,
                                        ".": {
                                          docs: {},
                                          df: 0,
                                          f: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                              docs: {},
                                              df: 0,
                                              r: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                  docs: {},
                                                  df: 0,
                                                  a: {
                                                    docs: {},
                                                    df: 0,
                                                    c: {
                                                      docs: {},
                                                      df: 0,
                                                      h: {
                                                        docs: {
                                                          "https://javelin.games/ecs/effects/":
                                                            {
                                                              tf: 1.0,
                                                            },
                                                        },
                                                        df: 1,
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        d: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                c: {
                                  docs: {},
                                  df: 0,
                                  h: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      d: {
                                        docs: {},
                                        df: 0,
                                        ".": {
                                          docs: {},
                                          df: 0,
                                          f: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                              docs: {},
                                              df: 0,
                                              r: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                  docs: {},
                                                  df: 0,
                                                  a: {
                                                    docs: {},
                                                    df: 0,
                                                    c: {
                                                      docs: {},
                                                      df: 0,
                                                      h: {
                                                        docs: {
                                                          "https://javelin.games/ecs/effects/":
                                                            {
                                                              tf: 1.0,
                                                            },
                                                        },
                                                        df: 1,
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        j: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    g: {
                                      docs: {},
                                      df: 0,
                                      ".": {
                                        docs: {},
                                        df: 0,
                                        f: {
                                          docs: {},
                                          df: 0,
                                          o: {
                                            docs: {},
                                            df: 0,
                                            r: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  c: {
                                                    docs: {},
                                                    df: 0,
                                                    h: {
                                                      docs: {},
                                                      df: 0,
                                                      "(": {
                                                        docs: {},
                                                        df: 0,
                                                        "(": {
                                                          docs: {
                                                            "https://javelin.games/ecs/effects/":
                                                              {
                                                                tf: 1.0,
                                                              },
                                                          },
                                                          df: 1,
                                                        },
                                                        e: {
                                                          docs: {},
                                                          df: 0,
                                                          n: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                              docs: {
                                                                "https://javelin.games/ecs/topics/":
                                                                  {
                                                                    tf: 1.0,
                                                                  },
                                                              },
                                                              df: 1,
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        s: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              u: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {},
                                      df: 0,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                          docs: {},
                                          df: 0,
                                          ".": {
                                            docs: {},
                                            df: 0,
                                            f: {
                                              docs: {},
                                              df: 0,
                                              o: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  e: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                      docs: {},
                                                      df: 0,
                                                      c: {
                                                        docs: {},
                                                        df: 0,
                                                        h: {
                                                          docs: {
                                                            "https://javelin.games/ecs/effects/":
                                                              {
                                                                tf: 1.0,
                                                              },
                                                          },
                                                          df: 1,
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        v: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            h: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                c: {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {
                                      "https://javelin.games/ecs/change-detection/":
                                        {
                                          tf: 1.0,
                                        },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                        w: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              h: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  m: {
                                    docs: {},
                                    df: 0,
                                    p: {
                                      docs: {},
                                      df: 0,
                                      u: {
                                        docs: {},
                                        df: 0,
                                        l: {
                                          docs: {},
                                          df: 0,
                                          s: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                              docs: {},
                                              df: 0,
                                              "(": {
                                                docs: {},
                                                df: 0,
                                                "(": {
                                                  docs: {},
                                                  df: 0,
                                                  e: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                      docs: {},
                                                      df: 0,
                                                      t: {
                                                        docs: {
                                                          "https://javelin.games/ecs/topics/":
                                                            {
                                                              tf: 1.0,
                                                            },
                                                        },
                                                        df: 1,
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                              ".": {
                                                docs: {},
                                                df: 0,
                                                f: {
                                                  docs: {},
                                                  df: 0,
                                                  o: {
                                                    docs: {},
                                                    df: 0,
                                                    r: {
                                                      docs: {},
                                                      df: 0,
                                                      e: {
                                                        docs: {},
                                                        df: 0,
                                                        a: {
                                                          docs: {},
                                                          df: 0,
                                                          c: {
                                                            docs: {},
                                                            df: 0,
                                                            h: {
                                                              docs: {},
                                                              df: 0,
                                                              "(": {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  n: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    t: {
                                                                      docs: {
                                                                        "https://javelin.games/ecs/topics/":
                                                                          {
                                                                            tf: 1.0,
                                                                          },
                                                                      },
                                                                      df: 1,
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                y: {
                  docs: {},
                  df: 0,
                  "'": {
                    docs: {
                      "https://javelin.games/ecs/events/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 2,
                  },
                  "(": {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          m: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {
                                "https://javelin.games/ecs/events/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                    p: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {
                                "https://javelin.games/ecs/systems/": {
                                  tf: 1.4142135623730951,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                  ".": {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                k: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                  l: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
        },
        r: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                u: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
            },
          },
          e: {
            docs: {
              "https://javelin.games/ecs/events/": { tf: 1.0 },
              "https://javelin.games/ecs/systems/": { tf: 1.0 },
            },
            df: 2,
            a: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                h: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
                t: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
              d: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/topics/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 3,
                "/": {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          f: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {
                                "https://javelin.games/ecs/effects/": {
                                  tf: 1.0,
                                },
                                "https://javelin.games/ecs/topics/": {
                                  tf: 1.0,
                                },
                              },
                              df: 2,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                i: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              l: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
            c: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            f: {
              docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
              df: 1,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                  },
                  df: 2,
                },
              },
            },
            g: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/world/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 4,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          h: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {
                                  "https://javelin.games/ecs/world/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                c: {
                  docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
              o: {
                docs: {},
                df: 0,
                v: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/topics/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 5,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              o: {
                docs: { "https://javelin.games/introduction/": { tf: 1.0 } },
                df: 1,
                s: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {
                              "https://javelin.games/ecs/performance/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                      "https://javelin.games/ecs/entities/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
              },
            },
            q: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 2.0 },
                      },
                      df: 1,
                      a: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        f: {
                                          docs: {},
                                          df: 0,
                                          r: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              m: {
                                                docs: {
                                                  "https://javelin.games/ecs/performance/":
                                                    {
                                                      tf: 1.7320508075688772,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      s: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                "&": {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {},
                                      df: 0,
                                      ";": {
                                        docs: {},
                                        df: 0,
                                        t: {
                                          docs: {},
                                          df: 0,
                                          "&": {
                                            docs: {},
                                            df: 0,
                                            g: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {
                                                  "https://javelin.games/ecs/effects/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                    e: {
                      docs: {},
                      df: 0,
                      "(": {
                        docs: {},
                        df: 0,
                        '"': {
                          docs: {},
                          df: 0,
                          "@": {
                            docs: {},
                            df: 0,
                            j: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                v: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                      docs: {},
                                      df: 0,
                                      i: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                          docs: {},
                                          df: 0,
                                          "/": {
                                            docs: {},
                                            df: 0,
                                            e: {
                                              docs: {},
                                              df: 0,
                                              c: {
                                                docs: {
                                                  "https://javelin.games/introduction/installation/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
                t: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 2,
                },
              },
              o: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                  },
                },
                u: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/resources/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": {
                        tf: 2.23606797749979,
                      },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/systems/": {
                        tf: 2.23606797749979,
                      },
                    },
                    df: 4,
                    s: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              h: {
                                docs: {},
                                df: 0,
                                "(": {
                                  docs: {},
                                  df: 0,
                                  "[": {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                  c: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      m: {
                                        docs: {},
                                        df: 0,
                                        p: {
                                          docs: {},
                                          df: 0,
                                          o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                              docs: {
                                                "https://javelin.games/ecs/systems/":
                                                  {
                                                    tf: 1.0,
                                                  },
                                              },
                                              df: 1,
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    v: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/effects/": {
                        tf: 3.3166247903554,
                      },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/world/": { tf: 1.0 },
                    },
                    df: 5,
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            c: {
              docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
              df: 1,
            },
          },
          u: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            n: {
              docs: {
                "https://javelin.games/ecs/effects/": { tf: 1.0 },
                "https://javelin.games/ecs/events/": { tf: 1.0 },
                "https://javelin.games/ecs/performance/": {
                  tf: 1.7320508075688772,
                },
              },
              df: 3,
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          y: {
            docs: {},
            df: 0,
            z: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                n: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
        },
        s: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  f: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/components/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/effects/": {
                    tf: 2.449489742783178,
                  },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                },
                df: 4,
              },
            },
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            w: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          c: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                e: {
                  docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                      },
                    },
                  },
                },
                e: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 3.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                e: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      h: {
                        docs: {},
                        df: 0,
                        o: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "https://javelin.games/ecs/performance/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 5,
                    },
                  },
                },
              },
            },
            e: {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.0 },
                "https://javelin.games/ecs/effects/": { tf: 1.0 },
                "https://javelin.games/ecs/performance/": { tf: 1.0 },
              },
              df: 3,
              m: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
            l: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                          "https://javelin.games/ecs/systems/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 2,
                        "'": {
                          docs: {
                            "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            "https://javelin.games/ecs/world/": { tf: 1.0 },
                          },
                          df: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 1,
              },
              t: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                },
                df: 1,
              },
            },
            p: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                r: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            q: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
              v: {
                docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                df: 1,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
            },
            t: {
              docs: {
                "https://javelin.games/ecs/components/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": {
                  tf: 1.4142135623730951,
                },
              },
              df: 2,
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        v: {
                          docs: {
                            "https://javelin.games/ecs/": { tf: 1.0 },
                            "https://javelin.games/ecs/performance/": {
                              tf: 1.0,
                            },
                            "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          },
                          df: 3,
                          a: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {},
                              df: 0,
                              "(": {
                                docs: {},
                                df: 0,
                                w: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                      docs: {},
                                      df: 0,
                                      l: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                          docs: {},
                                          df: 0,
                                          ".": {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {},
                                              df: 0,
                                              i: {
                                                docs: {},
                                                df: 0,
                                                c: {
                                                  docs: {},
                                                  df: 0,
                                                  k: {
                                                    docs: {
                                                      "https://javelin.games/ecs/world/":
                                                        {
                                                          tf: 1.0,
                                                        },
                                                    },
                                                    df: 1,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "https://javelin.games/ecs/effects/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            v: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              k: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 1,
                },
              },
              p: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/ecs/components/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                k: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                k: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {},
                      df: 0,
                      ".": {
                        docs: {},
                        df: 0,
                        f: {
                          docs: {},
                          df: 0,
                          o: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  c: {
                                    docs: {},
                                    df: 0,
                                    h: {
                                      docs: {},
                                      df: 0,
                                      "(": {
                                        docs: {},
                                        df: 0,
                                        "(": {
                                          docs: {
                                            "https://javelin.games/ecs/systems/":
                                              {
                                                tf: 1.4142135623730951,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      "'": {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                            "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          },
                          df: 2,
                        },
                      },
                    },
                    r: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
              w: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
            },
          },
          i: {
            docs: {},
            df: 0,
            d: {
              docs: {},
              df: 0,
              e: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            g: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/events/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    },
                    df: 2,
                    ".": {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          b: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              c: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  i: {
                                    docs: {},
                                    df: 0,
                                    b: {
                                      docs: {
                                        "https://javelin.games/ecs/events/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  t: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/systems/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            m: {
              docs: { "https://javelin.games/ecs/effects/": { tf: 2.0 } },
              df: 1,
              ".": {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                u: {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {},
                                    df: 0,
                                    s: {
                                      docs: {},
                                      df: 0,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        "(": {
                                          docs: {},
                                          df: 0,
                                          b: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                              docs: {},
                                              df: 0,
                                              d: {
                                                docs: {},
                                                df: 0,
                                                y: {
                                                  docs: {},
                                                  df: 0,
                                                  ".": {
                                                    docs: {},
                                                    df: 0,
                                                    s: {
                                                      docs: {},
                                                      df: 0,
                                                      i: {
                                                        docs: {},
                                                        df: 0,
                                                        m: {
                                                          docs: {},
                                                          df: 0,
                                                          u: {
                                                            docs: {},
                                                            df: 0,
                                                            l: {
                                                              docs: {},
                                                              df: 0,
                                                              a: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  i: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    o: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      n: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        i: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          d: {
                                                                            docs: {
                                                                              "https://javelin.games/ecs/effects/":
                                                                                {
                                                                                  tf: 1.0,
                                                                                },
                                                                            },
                                                                            df: 1,
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                s: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {},
                        df: 0,
                        "(": {
                          docs: {},
                          df: 0,
                          w: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      s: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                          docs: {},
                                          df: 0,
                                          a: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {},
                                              df: 0,
                                              e: {
                                                docs: {},
                                                df: 0,
                                                ".": {
                                                  docs: {},
                                                  df: 0,
                                                  c: {
                                                    docs: {},
                                                    df: 0,
                                                    u: {
                                                      docs: {},
                                                      df: 0,
                                                      r: {
                                                        docs: {},
                                                        df: 0,
                                                        r: {
                                                          docs: {},
                                                          df: 0,
                                                          e: {
                                                            docs: {},
                                                            df: 0,
                                                            n: {
                                                              docs: {},
                                                              df: 0,
                                                              t: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  i: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    c: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      k: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        d: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          a: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            t: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              a: {
                                                                                docs: {
                                                                                  "https://javelin.games/ecs/effects/":
                                                                                    {
                                                                                      tf: 1.0,
                                                                                    },
                                                                                },
                                                                                df: 1,
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                l: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/performance/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 3,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/effects/": { tf: 3.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  },
                  df: 4,
                  e: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {
                            "https://javelin.games/ecs/components/": {
                              tf: 1.0,
                            },
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                            "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          },
                          df: 3,
                        },
                      },
                    },
                  },
                },
              },
            },
            z: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/components/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 2,
              },
            },
          },
          k: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              p: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
              },
            },
          },
          l: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              w: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/world/": { tf: 2.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                  i: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                c: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          p: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                e: {
                  docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                  df: 1,
                  b: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                        df: 1,
                      },
                    },
                  },
                },
              },
              w: {
                docs: {},
                df: 0,
                n: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              c: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
                i: {
                  docs: {},
                  df: 0,
                  f: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                    df: 1,
                    i: {
                      docs: {
                        "https://javelin.games/ecs/components/": {
                          tf: 1.7320508075688772,
                        },
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 4,
                    },
                  },
                },
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/": {
                          tf: 1.7320508075688772,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
              e: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                k: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              "=": {
                docs: {},
                df: 0,
                '"': {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          _: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  u: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                      docs: {},
                                      df: 0,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                          docs: {},
                                          df: 0,
                                          "/": {
                                            docs: {},
                                            df: 0,
                                            "@": {
                                              docs: {},
                                              df: 0,
                                              j: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                  docs: {},
                                                  df: 0,
                                                  v: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                      docs: {},
                                                      df: 0,
                                                      l: {
                                                        docs: {},
                                                        df: 0,
                                                        i: {
                                                          docs: {},
                                                          df: 0,
                                                          n: {
                                                            docs: {},
                                                            df: 0,
                                                            "/": {
                                                              docs: {},
                                                              df: 0,
                                                              e: {
                                                                docs: {},
                                                                df: 0,
                                                                c: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  s: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    "/": {
                                                                      docs: {},
                                                                      df: 0,
                                                                      d: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        i: {
                                                                          docs: {},
                                                                          df: 0,
                                                                          s: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            t: {
                                                                              docs: {},
                                                                              df: 0,
                                                                              "/": {
                                                                                docs: {},
                                                                                df: 0,
                                                                                e: {
                                                                                  docs: {},
                                                                                  df: 0,
                                                                                  s: {
                                                                                    docs: {},
                                                                                    df: 0,
                                                                                    m: {
                                                                                      docs: {},
                                                                                      df: 0,
                                                                                      "/": {
                                                                                        docs: {},
                                                                                        df: 0,
                                                                                        i: {
                                                                                          docs: {},
                                                                                          df: 0,
                                                                                          n: {
                                                                                            docs: {},
                                                                                            df: 0,
                                                                                            d: {
                                                                                              docs: {},
                                                                                              df: 0,
                                                                                              e: {
                                                                                                docs: {},
                                                                                                df: 0,
                                                                                                x: {
                                                                                                  docs: {},
                                                                                                  df: 0,
                                                                                                  ".": {
                                                                                                    docs: {},
                                                                                                    df: 0,
                                                                                                    j: {
                                                                                                      docs: {},
                                                                                                      df: 0,
                                                                                                      s: {
                                                                                                        docs: {},
                                                                                                        df: 0,
                                                                                                        '"': {
                                                                                                          docs: {},
                                                                                                          df: 0,
                                                                                                          "&": {
                                                                                                            docs: {},
                                                                                                            df: 0,
                                                                                                            g: {
                                                                                                              docs: {},
                                                                                                              df: 0,
                                                                                                              t: {
                                                                                                                docs: {},
                                                                                                                df: 0,
                                                                                                                ";": {
                                                                                                                  docs: {},
                                                                                                                  df: 0,
                                                                                                                  "&": {
                                                                                                                    docs: {},
                                                                                                                    df: 0,
                                                                                                                    l: {
                                                                                                                      docs: {},
                                                                                                                      df: 0,
                                                                                                                      t: {
                                                                                                                        docs: {},
                                                                                                                        df: 0,
                                                                                                                        ";": {
                                                                                                                          docs: {},
                                                                                                                          df: 0,
                                                                                                                          "/": {
                                                                                                                            docs: {},
                                                                                                                            df: 0,
                                                                                                                            s: {
                                                                                                                              docs: {},
                                                                                                                              df: 0,
                                                                                                                              c: {
                                                                                                                                docs: {},
                                                                                                                                df: 0,
                                                                                                                                r: {
                                                                                                                                  docs: {},
                                                                                                                                  df: 0,
                                                                                                                                  i: {
                                                                                                                                    docs: {},
                                                                                                                                    df: 0,
                                                                                                                                    p: {
                                                                                                                                      docs: {},
                                                                                                                                      df: 0,
                                                                                                                                      t: {
                                                                                                                                        docs: {},
                                                                                                                                        df: 0,
                                                                                                                                        "&": {
                                                                                                                                          docs: {},
                                                                                                                                          df: 0,
                                                                                                                                          g: {
                                                                                                                                            docs: {},
                                                                                                                                            df: 0,
                                                                                                                                            t: {
                                                                                                                                              docs: {
                                                                                                                                                "https://javelin.games/introduction/installation/":
                                                                                                                                                  {
                                                                                                                                                    tf: 1.0,
                                                                                                                                                  },
                                                                                                                                              },
                                                                                                                                              df: 1,
                                                                                                                                            },
                                                                                                                                          },
                                                                                                                                        },
                                                                                                                                      },
                                                                                                                                    },
                                                                                                                                  },
                                                                                                                                },
                                                                                                                              },
                                                                                                                            },
                                                                                                                          },
                                                                                                                        },
                                                                                                                      },
                                                                                                                    },
                                                                                                                  },
                                                                                                                },
                                                                                                              },
                                                                                                            },
                                                                                                          },
                                                                                                        },
                                                                                                      },
                                                                                                    },
                                                                                                  },
                                                                                                },
                                                                                              },
                                                                                            },
                                                                                          },
                                                                                        },
                                                                                      },
                                                                                    },
                                                                                  },
                                                                                },
                                                                                j: {
                                                                                  docs: {},
                                                                                  df: 0,
                                                                                  a: {
                                                                                    docs: {},
                                                                                    df: 0,
                                                                                    v: {
                                                                                      docs: {},
                                                                                      df: 0,
                                                                                      e: {
                                                                                        docs: {},
                                                                                        df: 0,
                                                                                        l: {
                                                                                          docs: {},
                                                                                          df: 0,
                                                                                          i: {
                                                                                            docs: {},
                                                                                            df: 0,
                                                                                            n: {
                                                                                              docs: {
                                                                                                "https://javelin.games/introduction/installation/":
                                                                                                  {
                                                                                                    tf: 1.0,
                                                                                                  },
                                                                                              },
                                                                                              df: 1,
                                                                                            },
                                                                                          },
                                                                                        },
                                                                                      },
                                                                                    },
                                                                                  },
                                                                                },
                                                                              },
                                                                            },
                                                                          },
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          t: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/introduction/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 3.7416573867739413,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 5,
                  m: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/effects/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                  s: {
                    docs: {},
                    df: 0,
                    "/": {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {
                                    "https://javelin.games/ecs/": { tf: 1.0 },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              p: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            i: {
              docs: {},
              df: 0,
              c: {
                docs: {},
                df: 0,
                k: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
                e: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/performance/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.7320508075688772,
                    },
                  },
                  df: 5,
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
                n: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    },
                    df: 3,
                  },
                },
                v: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              u: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            b: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    i: {
                      docs: {},
                      df: 0,
                      b: {
                        docs: {
                          "https://javelin.games/ecs/events/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            p: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    e: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/components/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
          },
          w: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                h: {
                  docs: {
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
          y: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              c: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 1,
                h: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {
                          "https://javelin.games/ecs/entities/": { tf: 1.0 },
                        },
                        df: 1,
                        o: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              "/": {
                                docs: {},
                                df: 0,
                                s: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                      docs: {},
                                      df: 0,
                                      i: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                          docs: {},
                                          df: 0,
                                          l: {
                                            docs: {},
                                            df: 0,
                                            i: {
                                              docs: {},
                                              df: 0,
                                              z: {
                                                docs: {
                                                  "https://javelin.games/ecs/effects/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              a: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
                i: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                      docs: {},
                                      df: 0,
                                      o: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              n: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                  docs: {},
                                                  df: 0,
                                                  o: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                      docs: {
                                                        "https://javelin.games/ecs/systems/":
                                                          {
                                                            tf: 1.0,
                                                          },
                                                      },
                                                      df: 1,
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        m: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                          y: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  m: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              c: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    b: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              a: {
                                docs: {},
                                df: 0,
                                n: {
                                  docs: {},
                                  df: 0,
                                  s: {
                                    docs: {},
                                    df: 0,
                                    f: {
                                      docs: {},
                                      df: 0,
                                      o: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                          docs: {},
                                          df: 0,
                                          m: {
                                            docs: {
                                              "https://javelin.games/ecs/systems/":
                                                {
                                                  tf: 1.0,
                                                },
                                            },
                                            df: 1,
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              f: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            c: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {
                                  "https://javelin.games/ecs/effects/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 1,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  p: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 1,
                        s: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            m: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              j: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
              m: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  v: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                    e: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {},
                        df: 0,
                        e: {
                          docs: {},
                          df: 0,
                          n: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                r: {
                                  docs: {},
                                  df: 0,
                                  a: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      s: {
                                        docs: {},
                                        df: 0,
                                        f: {
                                          docs: {},
                                          df: 0,
                                          o: {
                                            docs: {},
                                            df: 0,
                                            r: {
                                              docs: {},
                                              df: 0,
                                              m: {
                                                docs: {
                                                  "https://javelin.games/ecs/systems/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              p: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  y: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/topics/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 4,
                      i: {
                        docs: {},
                        df: 0,
                        c: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            a: {
                              docs: {},
                              df: 0,
                              p: {
                                docs: {},
                                df: 0,
                                p: {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                i: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    k: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            d: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {
                                          "https://javelin.games/ecs/systems/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              q: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {
                              "https://javelin.games/ecs/effects/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    d: {
                      docs: {
                        "https://javelin.games/ecs/systems/": {
                          tf: 1.4142135623730951,
                        },
                      },
                      df: 1,
                      e: {
                        docs: {},
                        df: 0,
                        r: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                          u: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {},
                              df: 0,
                              r: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              s: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            f: {
                              docs: {},
                              df: 0,
                              f: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  c: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 2.6457513110645907 },
                      "https://javelin.games/ecs/effects/": { tf: 3.0 },
                      "https://javelin.games/ecs/entities/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/events/": {
                        tf: 1.4142135623730951,
                      },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": {
                        tf: 4.47213595499958,
                      },
                      "https://javelin.games/ecs/topics/": {
                        tf: 3.1622776601683795,
                      },
                      "https://javelin.games/ecs/world/": {
                        tf: 2.6457513110645907,
                      },
                      "https://javelin.games/introduction/": { tf: 1.0 },
                    },
                    df: 9,
                    d: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          c: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              i: {
                                docs: {},
                                df: 0,
                                p: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {
                                      "https://javelin.games/ecs/systems/": {
                                        tf: 1.0,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        t: {
          docs: {
            "https://javelin.games/ecs/effects/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/topics/": { tf: 1.0 },
          },
          df: 2,
          a: {
            docs: {},
            df: 0,
            g: {
              docs: {
                "https://javelin.games/ecs/systems/": { tf: 1.0 },
                "https://javelin.games/introduction/installation/": { tf: 1.0 },
              },
              df: 2,
            },
            k: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 6,
              },
            },
            r: {
              docs: {},
              df: 0,
              g: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              k: {
                docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                df: 1,
              },
            },
            x: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  o: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {
                          "https://javelin.games/ecs/components/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    q: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {
                          "https://javelin.games/ecs/change-detection/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            d: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            m: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {
                            "https://javelin.games/ecs/systems/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  f: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {
                          "https://javelin.games/ecs/change-detection/": {
                            tf: 1.0,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                g: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
                k: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
              r: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/events/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
              s: {
                docs: {},
                df: 0,
                ".": {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                          df: 1,
                        },
                        y: {
                          docs: {},
                          df: 0,
                          ".": {
                            docs: {},
                            df: 0,
                            v: {
                              docs: {},
                              df: 0,
                              e: {
                                docs: {},
                                df: 0,
                                l: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                      docs: {},
                                      df: 0,
                                      i: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                          docs: {},
                                          df: 0,
                                          y: {
                                            docs: {},
                                            df: 0,
                                            "[": {
                                              docs: {},
                                              df: 0,
                                              1: {
                                                docs: {
                                                  "https://javelin.games/ecs/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          "?": {
                            docs: {},
                            df: 0,
                            ".": {
                              docs: {},
                              df: 0,
                              v: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                              docs: {},
                                              df: 0,
                                              "[": {
                                                docs: {},
                                                df: 0,
                                                1: {
                                                  docs: {
                                                    "https://javelin.games/ecs/":
                                                      {
                                                        tf: 1.0,
                                                      },
                                                  },
                                                  df: 1,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                            df: 1,
                            ".": {
                              docs: {},
                              df: 0,
                              k: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  y: {
                                    docs: {},
                                    df: 0,
                                    "(": {
                                      docs: {},
                                      df: 0,
                                      '"': {
                                        docs: {},
                                        df: 0,
                                        s: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              c: {
                                                docs: {
                                                  "https://javelin.games/ecs/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  j: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {},
                        df: 0,
                        p: {
                          docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  h: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
                e: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 2,
                },
              },
              o: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  g: {
                    docs: {},
                    df: 0,
                    h: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
                w: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                  n: {
                    docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              k: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/effects/": {
                    tf: 3.1622776601683795,
                  },
                  "https://javelin.games/ecs/events/": {
                    tf: 3.1622776601683795,
                  },
                  "https://javelin.games/ecs/performance/": { tf: 2.0 },
                  "https://javelin.games/ecs/systems/": {
                    tf: 2.449489742783178,
                  },
                  "https://javelin.games/ecs/topics/": { tf: 2.23606797749979 },
                  "https://javelin.games/ecs/world/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 7,
              },
            },
            m: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 5,
                l: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
                r: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 1,
                },
              },
            },
            p: {
              docs: {
                "https://javelin.games/ecs/": { tf: 1.0 },
                "https://javelin.games/ecs/components/": { tf: 1.0 },
                "https://javelin.games/ecs/effects/": {
                  tf: 1.7320508075688772,
                },
                "https://javelin.games/ecs/entities/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/systems/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/topics/": { tf: 1.0 },
                "https://javelin.games/ecs/world/": { tf: 1.0 },
                "https://javelin.games/introduction/installation/": { tf: 1.0 },
              },
              df: 8,
            },
          },
          o: {
            docs: {},
            df: 0,
            o: {
              docs: {},
              df: 0,
              l: {
                docs: {
                  "https://javelin.games/introduction/installation/": {
                    tf: 1.0,
                  },
                },
                df: 1,
              },
            },
            p: {
              docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
              df: 1,
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 3.0 },
                  },
                  df: 2,
                  ".": {
                    docs: {},
                    df: 0,
                    f: {
                      docs: {},
                      df: 0,
                      l: {
                        docs: {},
                        df: 0,
                        u: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            h: {
                              docs: {
                                "https://javelin.games/ecs/topics/": {
                                  tf: 1.0,
                                },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                    p: {
                      docs: {},
                      df: 0,
                      u: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          h: {
                            docs: {
                              "https://javelin.games/ecs/topics/": { tf: 1.0 },
                            },
                            df: 1,
                            i: {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                m: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {},
                                      df: 0,
                                      i: {
                                        docs: {
                                          "https://javelin.games/ecs/topics/": {
                                            tf: 1.0,
                                          },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    t: {
                      docs: {
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
              n: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/events/": {
                          tf: 1.7320508075688772,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                  df: 1,
                },
              },
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/introduction/installation/": {
                    tf: 1.0,
                  },
                },
                df: 2,
              },
            },
            i: {
              docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
              df: 1,
              c: {
                docs: {},
                df: 0,
                k: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
              },
              g: {
                docs: {},
                df: 0,
                g: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/events/": {
                          tf: 2.23606797749979,
                        },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        "https://javelin.games/ecs/world/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
              v: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/entities/": { tf: 1.0 },
                },
                df: 3,
              },
            },
          },
          u: {
            docs: {},
            df: 0,
            p: {
              docs: {},
              df: 0,
              l: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 2.0 } },
                df: 1,
              },
            },
          },
          w: {
            docs: {},
            df: 0,
            o: {
              docs: {
                "https://javelin.games/ecs/performance/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/systems/": { tf: 1.0 },
              },
              df: 2,
            },
          },
          y: {
            docs: {},
            df: 0,
            p: {
              docs: {},
              df: 0,
              e: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/components/": {
                    tf: 4.47213595499958,
                  },
                  "https://javelin.games/ecs/effects/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/events/": {
                    tf: 2.449489742783178,
                  },
                  "https://javelin.games/ecs/performance/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.7320508075688772,
                  },
                  "https://javelin.games/ecs/topics/": { tf: 2.23606797749979 },
                  "https://javelin.games/ecs/world/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 9,
                "'": {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                  },
                  df: 1,
                },
                "=": {
                  docs: {},
                  df: 0,
                  '"': {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {},
                          df: 0,
                          u: {
                            docs: {},
                            df: 0,
                            l: {
                              docs: {
                                "https://javelin.games/introduction/installation/":
                                  {
                                    tf: 1.0,
                                  },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
                d: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          y: {
                            docs: {
                              "https://javelin.games/ecs/performance/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    "https://javelin.games/ecs/performance/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
            },
          },
        },
        u: {
          docs: {},
          df: 0,
          l: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                m: {
                  docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          m: {
            docs: {},
            df: 0,
            d: {
              docs: {
                "https://javelin.games/introduction/installation/": {
                  tf: 1.4142135623730951,
                },
              },
              df: 1,
            },
          },
          n: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              v: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            d: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                n: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
                r: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      a: {
                        docs: {},
                        df: 0,
                        n: {
                          docs: {},
                          df: 0,
                          d: {
                            docs: {
                              "https://javelin.games/ecs/performance/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            f: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      i: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {
                              "https://javelin.games/ecs/performance/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            i: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                n: {
                  docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                  df: 1,
                },
              },
              q: {
                docs: {},
                df: 0,
                u: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                  },
                  df: 3,
                },
              },
              t: {
                docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                df: 1,
              },
            },
            l: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                k: {
                  docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            n: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    s: {
                      docs: {},
                      df: 0,
                      s: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          r: {
                            docs: {},
                            df: 0,
                            i: {
                              docs: {
                                "https://javelin.games/ecs/": { tf: 1.0 },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              b: {
                docs: {},
                df: 0,
                s: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      v: {
                        docs: {
                          "https://javelin.games/ecs/change-detection/": {
                            tf: 1.0,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                m: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {},
                      df: 0,
                      k: {
                        docs: {
                          "https://javelin.games/ecs/components/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                b: {
                  docs: {},
                  df: 0,
                  s: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: {},
                      df: 0,
                      r: {
                        docs: {},
                        df: 0,
                        i: {
                          docs: {},
                          df: 0,
                          b: {
                            docs: {
                              "https://javelin.games/ecs/events/": {
                                tf: 1.4142135623730951,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                l: {
                  docs: {
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": {
                      tf: 1.4142135623730951,
                    },
                  },
                  df: 3,
                },
              },
            },
          },
          p: {
            docs: {
              "https://javelin.games/ecs/": { tf: 1.0 },
              "https://javelin.games/ecs/components/": { tf: 1.0 },
            },
            df: 2,
            d: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 4,
                },
              },
            },
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                r: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      m: {
                        docs: {
                          "https://javelin.games/ecs/topics/": { tf: 1.0 },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            l: {
              docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
              df: 1,
            },
          },
          s: {
            docs: {
              "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
              "https://javelin.games/ecs/change-detection/": {
                tf: 2.449489742783178,
              },
              "https://javelin.games/ecs/components/": {
                tf: 2.6457513110645907,
              },
              "https://javelin.games/ecs/effects/": { tf: 3.0 },
              "https://javelin.games/ecs/entities/": { tf: 2.23606797749979 },
              "https://javelin.games/ecs/events/": { tf: 1.7320508075688772 },
              "https://javelin.games/ecs/performance/": { tf: 1.0 },
              "https://javelin.games/ecs/systems/": { tf: 2.8284271247461903 },
              "https://javelin.games/ecs/topics/": { tf: 2.449489742783178 },
              "https://javelin.games/ecs/world/": { tf: 2.449489742783178 },
              "https://javelin.games/introduction/": { tf: 1.4142135623730951 },
            },
            df: 11,
            a: {
              docs: {},
              df: 0,
              g: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 1.0 } },
                df: 1,
              },
            },
            e: {
              docs: {},
              df: 0,
              r: {
                docs: {
                  "https://javelin.games/ecs/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/systems/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 4,
              },
            },
          },
        },
        v: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            l: {
              docs: {},
              df: 0,
              u: {
                docs: {
                  "https://javelin.games/ecs/components/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/effects/": { tf: 2.0 },
                  "https://javelin.games/ecs/entities/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.7320508075688772,
                  },
                },
                df: 4,
              },
            },
            r: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  b: {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {
                        "https://javelin.games/ecs/effects/": {
                          tf: 1.4142135623730951,
                        },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                        "https://javelin.games/ecs/systems/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
          },
          e: {
            docs: {},
            df: 0,
            c: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/performance/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            h: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
                    },
                    df: 1,
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                c: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.7320508075688772 },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.7320508075688772,
                    },
                  },
                  df: 2,
                  i: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {},
                      df: 0,
                      y: {
                        docs: {},
                        df: 0,
                        ".": {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                          x: {
                            docs: {
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                            },
                            df: 1,
                          },
                        },
                        "[": {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            "]": {
                              docs: {},
                              df: 0,
                              ".": {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                                x: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            r: {
              docs: {},
              df: 0,
              i: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/performance/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 2,
              },
              s: {
                docs: {},
                df: 0,
                u: {
                  docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            a: {
              docs: {
                "https://javelin.games/ecs/components/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/introduction/installation/": {
                  tf: 1.7320508075688772,
                },
              },
              df: 3,
            },
          },
          o: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              d: {
                docs: {
                  "https://javelin.games/ecs/systems/": {
                    tf: 1.4142135623730951,
                  },
                },
                df: 1,
              },
            },
            l: {
              docs: {},
              df: 0,
              u: {
                docs: {},
                df: 0,
                m: {
                  docs: {
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
        },
        w: {
          docs: {},
          df: 0,
          a: {
            docs: {},
            df: 0,
            i: {
              docs: {},
              df: 0,
              t: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
              },
            },
            n: {
              docs: {},
              df: 0,
              t: {
                docs: {
                  "https://javelin.games/ecs/change-detection/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/events/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": {
                    tf: 1.4142135623730951,
                  },
                  "https://javelin.games/ecs/world/": { tf: 1.0 },
                },
                df: 5,
              },
            },
            y: {
              docs: {
                "https://javelin.games/ecs/performance/": { tf: 1.0 },
                "https://javelin.games/ecs/systems/": {
                  tf: 1.4142135623730951,
                },
                "https://javelin.games/ecs/topics/": { tf: 1.4142135623730951 },
                "https://javelin.games/ecs/world/": { tf: 1.0 },
              },
              df: 4,
            },
          },
          e: {
            docs: {},
            df: 0,
            "'": {
              docs: {},
              df: 0,
              d: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
              l: {
                docs: {},
                df: 0,
                l: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            a: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
            b: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  c: {
                    docs: {},
                    df: 0,
                    k: {
                      docs: {
                        "https://javelin.games/introduction/installation/": {
                          tf: 1.0,
                        },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            l: {
              docs: {},
              df: 0,
              l: {
                docs: { "https://javelin.games/ecs/entities/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
          h: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                "'": {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
            e: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                h: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    r: {
                      docs: {
                        "https://javelin.games/ecs/": { tf: 1.0 },
                        "https://javelin.games/ecs/events/": { tf: 1.0 },
                      },
                      df: 2,
                    },
                  },
                },
              },
            },
            o: {
              docs: {},
              df: 0,
              s: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/ecs/events/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                  },
                  df: 2,
                },
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              d: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  w: {
                    docs: {},
                    df: 0,
                    ".": {
                      docs: {},
                      df: 0,
                      j: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          v: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              l: {
                                docs: {},
                                df: 0,
                                i: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {
                                      "https://javelin.games/introduction/installation/":
                                        {
                                          tf: 1.0,
                                        },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              h: {
                docs: {},
                df: 0,
                i: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.7320508075688772,
                      },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                      "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      "https://javelin.games/ecs/systems/": { tf: 1.0 },
                    },
                    df: 5,
                  },
                },
                o: {
                  docs: {},
                  df: 0,
                  u: {
                    docs: {},
                    df: 0,
                    t: {
                      docs: {
                        "https://javelin.games/ecs/effects/": { tf: 1.0 },
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                        "https://javelin.games/ecs/topics/": { tf: 1.0 },
                      },
                      df: 3,
                    },
                  },
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              k: {
                docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                df: 1,
                e: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {
                      "https://javelin.games/ecs/effects/": {
                        tf: 1.4142135623730951,
                      },
                    },
                    df: 1,
                  },
                },
              },
              l: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                    "https://javelin.games/ecs/components/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/entities/": {
                      tf: 1.4142135623730951,
                    },
                    "https://javelin.games/ecs/events/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 3.4641016151377544,
                    },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 3.3166247903554 },
                    "https://javelin.games/introduction/installation/": {
                      tf: 1.0,
                    },
                  },
                  df: 10,
                  "&": {
                    docs: {},
                    df: 0,
                    l: {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {},
                        df: 0,
                        ";": {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            "&": {
                              docs: {},
                              df: 0,
                              g: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "https://javelin.games/ecs/systems/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  ".": {
                    docs: {},
                    df: 0,
                    a: {
                      docs: {},
                      df: 0,
                      d: {
                        docs: {},
                        df: 0,
                        d: {
                          docs: {},
                          df: 0,
                          s: {
                            docs: {},
                            df: 0,
                            y: {
                              docs: {},
                              df: 0,
                              s: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                        "https://javelin.games/ecs/world/": {
                                          tf: 1.4142135623730951,
                                        },
                                      },
                                      df: 2,
                                      "(": {
                                        docs: {},
                                        df: 0,
                                        s: {
                                          docs: {},
                                          df: 0,
                                          y: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                              docs: {},
                                              df: 0,
                                              r: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                  docs: {},
                                                  df: 0,
                                                  n: {
                                                    docs: {},
                                                    df: 0,
                                                    d: {
                                                      docs: {
                                                        "https://javelin.games/ecs/systems/":
                                                          {
                                                            tf: 1.0,
                                                          },
                                                      },
                                                      df: 1,
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      t: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            c: {
                              docs: {},
                              df: 0,
                              h: {
                                docs: {
                                  "https://javelin.games/ecs/entities/": {
                                    tf: 1.4142135623730951,
                                  },
                                  "https://javelin.games/ecs/events/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 2,
                                "(": {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {
                                          "https://javelin.games/ecs/entities/":
                                            {
                                              tf: 1.0,
                                            },
                                          "https://javelin.games/ecs/topics/": {
                                            tf: 1.0,
                                          },
                                        },
                                        df: 2,
                                      },
                                    },
                                  },
                                },
                                e: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      s: {
                                        docs: {},
                                        df: 0,
                                        u: {
                                          docs: {},
                                          df: 0,
                                          b: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                              docs: {},
                                              df: 0,
                                              c: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  i: {
                                                    docs: {},
                                                    df: 0,
                                                    b: {
                                                      docs: {
                                                        "https://javelin.games/ecs/events/":
                                                          {
                                                            tf: 1.0,
                                                          },
                                                      },
                                                      df: 1,
                                                      e: {
                                                        docs: {},
                                                        df: 0,
                                                        "(": {
                                                          docs: {},
                                                          df: 0,
                                                          "(": {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              n: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/events/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    c: {
                      docs: {},
                      df: 0,
                      o: {
                        docs: {},
                        df: 0,
                        m: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {
                                  "https://javelin.games/ecs/components/": {
                                    tf: 1.7320508075688772,
                                  },
                                },
                                df: 1,
                                e: {
                                  docs: {},
                                  df: 0,
                                  n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {},
                                      df: 0,
                                      "(": {
                                        docs: {},
                                        df: 0,
                                        i: {
                                          docs: {},
                                          df: 0,
                                          m: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              u: {
                                                docs: {},
                                                df: 0,
                                                l: {
                                                  docs: {},
                                                  df: 0,
                                                  s: {
                                                    docs: {
                                                      "https://javelin.games/ecs/topics/":
                                                        {
                                                          tf: 1.0,
                                                        },
                                                    },
                                                    df: 1,
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                        p: {
                                          docs: {},
                                          df: 0,
                                          l: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                              docs: {},
                                              df: 0,
                                              y: {
                                                docs: {
                                                  "https://javelin.games/ecs/systems/":
                                                    {
                                                      tf: 1.0,
                                                    },
                                                },
                                                df: 1,
                                              },
                                            },
                                          },
                                          o: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                              docs: {},
                                              df: 0,
                                              i: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                  docs: {
                                                    "https://javelin.games/ecs/components/":
                                                      {
                                                        tf: 1.0,
                                                      },
                                                    "https://javelin.games/ecs/systems/":
                                                      {
                                                        tf: 1.0,
                                                      },
                                                  },
                                                  df: 2,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    d: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        s: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            r: {
                              docs: {},
                              df: 0,
                              o: {
                                docs: {},
                                df: 0,
                                y: {
                                  docs: {
                                    "https://javelin.games/ecs/entities/": {
                                      tf: 1.0,
                                    },
                                    "https://javelin.games/ecs/events/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 2,
                                  "(": {
                                    docs: {},
                                    df: 0,
                                    e: {
                                      docs: {},
                                      df: 0,
                                      n: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                          docs: {
                                            "https://javelin.games/ecs/entities/":
                                              {
                                                tf: 1.0,
                                              },
                                          },
                                          df: 1,
                                        },
                                      },
                                    },
                                  },
                                  e: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                      docs: {},
                                      df: 0,
                                      ".": {
                                        docs: {},
                                        df: 0,
                                        s: {
                                          docs: {},
                                          df: 0,
                                          u: {
                                            docs: {},
                                            df: 0,
                                            b: {
                                              docs: {},
                                              df: 0,
                                              s: {
                                                docs: {},
                                                df: 0,
                                                c: {
                                                  docs: {},
                                                  df: 0,
                                                  r: {
                                                    docs: {},
                                                    df: 0,
                                                    i: {
                                                      docs: {},
                                                      df: 0,
                                                      b: {
                                                        docs: {},
                                                        df: 0,
                                                        e: {
                                                          docs: {},
                                                          df: 0,
                                                          "(": {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              n: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/events/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        t: {
                          docs: {},
                          df: 0,
                          a: {
                            docs: {},
                            df: 0,
                            c: {
                              docs: {},
                              df: 0,
                              h: {
                                docs: {
                                  "https://javelin.games/ecs/entities/": {
                                    tf: 1.4142135623730951,
                                  },
                                  "https://javelin.games/ecs/events/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 2,
                                "(": {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {
                                          "https://javelin.games/ecs/entities/":
                                            {
                                              tf: 1.0,
                                            },
                                          "https://javelin.games/ecs/topics/": {
                                            tf: 1.0,
                                          },
                                        },
                                        df: 2,
                                      },
                                    },
                                  },
                                },
                                e: {
                                  docs: {},
                                  df: 0,
                                  d: {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      s: {
                                        docs: {},
                                        df: 0,
                                        u: {
                                          docs: {},
                                          df: 0,
                                          b: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                              docs: {},
                                              df: 0,
                                              c: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                  docs: {},
                                                  df: 0,
                                                  i: {
                                                    docs: {},
                                                    df: 0,
                                                    b: {
                                                      docs: {},
                                                      df: 0,
                                                      e: {
                                                        docs: {},
                                                        df: 0,
                                                        "(": {
                                                          docs: {},
                                                          df: 0,
                                                          "(": {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              n: {
                                                                docs: {},
                                                                df: 0,
                                                                t: {
                                                                  docs: {
                                                                    "https://javelin.games/ecs/events/":
                                                                      {
                                                                        tf: 1.0,
                                                                      },
                                                                  },
                                                                  df: 1,
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    g: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/ecs/world/": { tf: 1.0 },
                          },
                          df: 1,
                          "(": {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              n: {
                                docs: {},
                                df: 0,
                                t: {
                                  docs: {
                                    "https://javelin.games/ecs/world/": {
                                      tf: 1.0,
                                    },
                                  },
                                  df: 1,
                                },
                              },
                            },
                          },
                          c: {
                            docs: {},
                            df: 0,
                            o: {
                              docs: {},
                              df: 0,
                              m: {
                                docs: {},
                                df: 0,
                                p: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                          docs: {},
                                          df: 0,
                                          t: {
                                            docs: {},
                                            df: 0,
                                            m: {
                                              docs: {},
                                              df: 0,
                                              u: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                  docs: {
                                                    "https://javelin.games/ecs/change-detection/":
                                                      {
                                                        tf: 1.0,
                                                      },
                                                  },
                                                  df: 1,
                                                  a: {
                                                    docs: {},
                                                    df: 0,
                                                    t: {
                                                      docs: {},
                                                      df: 0,
                                                      i: {
                                                        docs: {},
                                                        df: 0,
                                                        o: {
                                                          docs: {},
                                                          df: 0,
                                                          n: {
                                                            docs: {},
                                                            df: 0,
                                                            s: {
                                                              docs: {},
                                                              df: 0,
                                                              "(": {
                                                                docs: {},
                                                                df: 0,
                                                                p: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  o: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    s: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      i: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        t: {
                                                                          docs: {
                                                                            "https://javelin.games/ecs/change-detection/":
                                                                              {
                                                                                tf: 1.0,
                                                                              },
                                                                          },
                                                                          df: 1,
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                          o: {
                            docs: {},
                            df: 0,
                            b: {
                              docs: {},
                              df: 0,
                              s: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  r: {
                                    docs: {},
                                    df: 0,
                                    v: {
                                      docs: {
                                        "https://javelin.games/ecs/change-detection/":
                                          {
                                            tf: 1.0,
                                          },
                                      },
                                      df: 1,
                                      e: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                          docs: {},
                                          df: 0,
                                          "(": {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              o: {
                                                docs: {},
                                                df: 0,
                                                s: {
                                                  docs: {},
                                                  df: 0,
                                                  i: {
                                                    docs: {},
                                                    df: 0,
                                                    t: {
                                                      docs: {
                                                        "https://javelin.games/ecs/change-detection/":
                                                          {
                                                            tf: 1.0,
                                                          },
                                                      },
                                                      df: 1,
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    r: {
                      docs: {},
                      df: 0,
                      e: {
                        docs: {},
                        df: 0,
                        g: {
                          docs: {},
                          df: 0,
                          i: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {},
                                df: 0,
                                e: {
                                  docs: {},
                                  df: 0,
                                  r: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                      docs: {},
                                      df: 0,
                                      o: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                          docs: {},
                                          df: 0,
                                          p: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                              docs: {},
                                              df: 0,
                                              n: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                  docs: {},
                                                  df: 0,
                                                  n: {
                                                    docs: {},
                                                    df: 0,
                                                    t: {
                                                      docs: {},
                                                      df: 0,
                                                      t: {
                                                        docs: {},
                                                        df: 0,
                                                        y: {
                                                          docs: {},
                                                          df: 0,
                                                          p: {
                                                            docs: {
                                                              "https://javelin.games/ecs/components/":
                                                                {
                                                                  tf: 1.0,
                                                                },
                                                            },
                                                            df: 1,
                                                            e: {
                                                              docs: {},
                                                              df: 0,
                                                              "(": {
                                                                docs: {},
                                                                df: 0,
                                                                p: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  o: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    s: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      i: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        t: {
                                                                          docs: {
                                                                            "https://javelin.games/ecs/components/":
                                                                              {
                                                                                tf: 1.0,
                                                                              },
                                                                          },
                                                                          df: 1,
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        s: {
                          docs: {},
                          df: 0,
                          e: {
                            docs: {},
                            df: 0,
                            t: {
                              docs: {
                                "https://javelin.games/ecs/world/": { tf: 1.0 },
                              },
                              df: 1,
                            },
                          },
                        },
                      },
                    },
                    s: {
                      docs: {},
                      df: 0,
                      n: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          p: {
                            docs: {},
                            df: 0,
                            s: {
                              docs: {},
                              df: 0,
                              h: {
                                docs: {},
                                df: 0,
                                o: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {
                                      "https://javelin.games/ecs/world/": {
                                        tf: 1.4142135623730951,
                                      },
                                    },
                                    df: 1,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      p: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          w: {
                            docs: {},
                            df: 0,
                            n: {
                              docs: {
                                "https://javelin.games/ecs/entities/": {
                                  tf: 1.0,
                                },
                                "https://javelin.games/ecs/events/": {
                                  tf: 1.0,
                                },
                              },
                              df: 2,
                              "(": {
                                docs: {},
                                df: 0,
                                ".": {
                                  docs: {},
                                  df: 0,
                                  ".": {
                                    docs: {},
                                    df: 0,
                                    ".": {
                                      docs: {},
                                      df: 0,
                                      c: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                          docs: {},
                                          df: 0,
                                          m: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                              docs: {},
                                              df: 0,
                                              o: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                  docs: {
                                                    "https://javelin.games/ecs/entities/":
                                                      {
                                                        tf: 1.0,
                                                      },
                                                  },
                                                  df: 1,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                                p: {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {},
                                      df: 0,
                                      y: {
                                        docs: {
                                          "https://javelin.games/ecs/entities/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                                w: {
                                  docs: {},
                                  df: 0,
                                  o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                      docs: {},
                                      df: 0,
                                      l: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                          docs: {},
                                          df: 0,
                                          ".": {
                                            docs: {},
                                            df: 0,
                                            c: {
                                              docs: {},
                                              df: 0,
                                              o: {
                                                docs: {},
                                                df: 0,
                                                m: {
                                                  docs: {},
                                                  df: 0,
                                                  p: {
                                                    docs: {},
                                                    df: 0,
                                                    o: {
                                                      docs: {},
                                                      df: 0,
                                                      n: {
                                                        docs: {},
                                                        df: 0,
                                                        e: {
                                                          docs: {},
                                                          df: 0,
                                                          n: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                              docs: {},
                                                              df: 0,
                                                              "(": {
                                                                docs: {},
                                                                df: 0,
                                                                p: {
                                                                  docs: {},
                                                                  df: 0,
                                                                  l: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    a: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      y: {
                                                                        docs: {
                                                                          "https://javelin.games/ecs/systems/":
                                                                            {
                                                                              tf: 1.0,
                                                                            },
                                                                        },
                                                                        df: 1,
                                                                      },
                                                                    },
                                                                  },
                                                                  o: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    s: {
                                                                      docs: {},
                                                                      df: 0,
                                                                      i: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        t: {
                                                                          docs: {
                                                                            "https://javelin.games/ecs/systems/":
                                                                              {
                                                                                tf: 1.0,
                                                                              },
                                                                          },
                                                                          df: 1,
                                                                        },
                                                                      },
                                                                    },
                                                                  },
                                                                },
                                                              },
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                              e: {
                                docs: {},
                                df: 0,
                                d: {
                                  docs: {},
                                  df: 0,
                                  ".": {
                                    docs: {},
                                    df: 0,
                                    s: {
                                      docs: {},
                                      df: 0,
                                      u: {
                                        docs: {},
                                        df: 0,
                                        b: {
                                          docs: {},
                                          df: 0,
                                          s: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                              docs: {},
                                              df: 0,
                                              r: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                  docs: {},
                                                  df: 0,
                                                  b: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                      docs: {},
                                                      df: 0,
                                                      "(": {
                                                        docs: {},
                                                        df: 0,
                                                        e: {
                                                          docs: {},
                                                          df: 0,
                                                          n: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                              docs: {
                                                                "https://javelin.games/ecs/events/":
                                                                  {
                                                                    tf: 1.0,
                                                                  },
                                                              },
                                                              df: 1,
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      t: {
                        docs: {},
                        df: 0,
                        a: {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              ".": {
                                docs: {},
                                df: 0,
                                c: {
                                  docs: {},
                                  df: 0,
                                  u: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                      docs: {},
                                      df: 0,
                                      r: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                          docs: {},
                                          df: 0,
                                          n: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                              docs: {},
                                              df: 0,
                                              t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                  docs: {},
                                                  df: 0,
                                                  c: {
                                                    docs: {},
                                                    df: 0,
                                                    k: {
                                                      docs: {},
                                                      df: 0,
                                                      d: {
                                                        docs: {},
                                                        df: 0,
                                                        a: {
                                                          docs: {},
                                                          df: 0,
                                                          t: {
                                                            docs: {},
                                                            df: 0,
                                                            a: {
                                                              docs: {
                                                                "https://javelin.games/ecs/systems/":
                                                                  {
                                                                    tf: 1.0,
                                                                  },
                                                              },
                                                              df: 1,
                                                            },
                                                          },
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    t: {
                      docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                      df: 1,
                      i: {
                        docs: {},
                        df: 0,
                        c: {
                          docs: {},
                          df: 0,
                          k: {
                            docs: {
                              "https://javelin.games/ecs/entities/": {
                                tf: 2.0,
                              },
                              "https://javelin.games/ecs/systems/": { tf: 1.0 },
                              "https://javelin.games/ecs/world/": { tf: 1.0 },
                            },
                            df: 3,
                            "(": {
                              docs: {},
                              df: 0,
                              d: {
                                docs: {},
                                df: 0,
                                a: {
                                  docs: {},
                                  df: 0,
                                  t: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                      docs: {
                                        "https://javelin.games/ecs/systems/": {
                                          tf: 1.0,
                                        },
                                      },
                                      df: 1,
                                    },
                                  },
                                },
                                e: {
                                  docs: {},
                                  df: 0,
                                  l: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                      docs: {},
                                      df: 0,
                                      a: {
                                        docs: {
                                          "https://javelin.games/ecs/systems/":
                                            {
                                              tf: 1.0,
                                            },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      r: {
                        docs: {},
                        df: 0,
                        y: {
                          docs: {},
                          df: 0,
                          g: {
                            docs: {},
                            df: 0,
                            e: {
                              docs: {},
                              df: 0,
                              t: {
                                docs: {
                                  "https://javelin.games/ecs/world/": {
                                    tf: 1.0,
                                  },
                                },
                                df: 1,
                                "(": {
                                  docs: {},
                                  df: 0,
                                  e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                      docs: {},
                                      df: 0,
                                      t: {
                                        docs: {
                                          "https://javelin.games/ecs/world/": {
                                            tf: 1.0,
                                          },
                                        },
                                        df: 1,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  _: {
                    docs: {},
                    df: 0,
                    o: {
                      docs: {},
                      df: 0,
                      p: {
                        docs: {},
                        df: 0,
                        ".": {
                          docs: {},
                          df: 0,
                          t: {
                            docs: {
                              "https://javelin.games/ecs/entities/": {
                                tf: 1.0,
                              },
                            },
                            df: 1,
                          },
                        },
                      },
                    },
                  },
                  o: {
                    docs: {},
                    df: 0,
                    p: {
                      docs: {
                        "https://javelin.games/ecs/entities/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                d: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {},
                    df: 0,
                    "'": {
                      docs: {},
                      df: 0,
                      t: {
                        docs: {
                          "https://javelin.games/ecs/effects/": {
                            tf: 1.4142135623730951,
                          },
                        },
                        df: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          r: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              p: {
                docs: {
                  "https://javelin.games/ecs/components/": { tf: 1.0 },
                  "https://javelin.games/ecs/effects/": { tf: 1.0 },
                  "https://javelin.games/ecs/topics/": { tf: 1.0 },
                },
                df: 3,
              },
            },
            i: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {
                    "https://javelin.games/ecs/": { tf: 1.0 },
                    "https://javelin.games/ecs/effects/": { tf: 1.0 },
                    "https://javelin.games/ecs/topics/": { tf: 1.0 },
                    "https://javelin.games/ecs/world/": { tf: 1.0 },
                  },
                  df: 4,
                },
                t: {
                  docs: {},
                  df: 0,
                  e: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
        },
        x: {
          docs: {
            "https://javelin.games/ecs/": { tf: 1.0 },
            "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
            "https://javelin.games/ecs/components/": { tf: 2.449489742783178 },
            "https://javelin.games/ecs/topics/": { tf: 1.0 },
          },
          df: 4,
        },
        y: {
          docs: {
            "https://javelin.games/ecs/": { tf: 1.4142135623730951 },
            "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
            "https://javelin.games/ecs/components/": { tf: 2.23606797749979 },
            "https://javelin.games/ecs/topics/": { tf: 1.0 },
          },
          df: 4,
          a: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              n: {
                docs: { "https://javelin.games/ecs/performance/": { tf: 2.0 } },
                df: 1,
              },
            },
          },
          i: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                d: {
                  docs: {
                    "https://javelin.games/ecs/events/": {
                      tf: 1.7320508075688772,
                    },
                    "https://javelin.games/ecs/systems/": {
                      tf: 1.7320508075688772,
                    },
                  },
                  df: 2,
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            n: {
              docs: {},
              df: 0,
              a: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  a: {
                    docs: {},
                    df: 0,
                    n: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
            u: {
              docs: {},
              df: 0,
              "'": {
                docs: {},
                df: 0,
                d: {
                  docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                  df: 1,
                },
                l: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/ecs/effects/": { tf: 1.0 },
                      "https://javelin.games/ecs/events/": { tf: 1.0 },
                    },
                    df: 2,
                  },
                },
                r: {
                  docs: { "https://javelin.games/ecs/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
        },
        z: {
          docs: {},
          df: 0,
          e: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              o: {
                docs: { "https://javelin.games/ecs/components/": { tf: 1.0 } },
                df: 1,
              },
            },
          },
        },
      },
    },
    title: {
      root: {
        docs: {},
        df: 0,
        c: {
          docs: {},
          df: 0,
          h: {
            docs: {},
            df: 0,
            a: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                g: {
                  docs: {
                    "https://javelin.games/ecs/change-detection/": { tf: 1.0 },
                  },
                  df: 1,
                },
              },
            },
          },
          o: {
            docs: {},
            df: 0,
            m: {
              docs: {},
              df: 0,
              p: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  n: {
                    docs: {
                      "https://javelin.games/ecs/components/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
        },
        d: {
          docs: {},
          df: 0,
          e: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: {
                      "https://javelin.games/ecs/change-detection/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
        },
        e: {
          docs: {},
          df: 0,
          c: { docs: { "https://javelin.games/ecs/": { tf: 1.0 } }, df: 1 },
          f: {
            docs: {},
            df: 0,
            f: {
              docs: {},
              df: 0,
              e: {
                docs: {},
                df: 0,
                c: {
                  docs: {},
                  df: 0,
                  t: {
                    docs: { "https://javelin.games/ecs/effects/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
          n: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                t: {
                  docs: {},
                  df: 0,
                  i: {
                    docs: {
                      "https://javelin.games/ecs/entities/": { tf: 1.0 },
                    },
                    df: 1,
                  },
                },
              },
            },
          },
          v: {
            docs: {},
            df: 0,
            e: {
              docs: {},
              df: 0,
              n: {
                docs: {},
                df: 0,
                t: {
                  docs: { "https://javelin.games/ecs/events/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
        },
        i: {
          docs: {},
          df: 0,
          n: {
            docs: {},
            df: 0,
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                a: {
                  docs: {},
                  df: 0,
                  l: {
                    docs: {
                      "https://javelin.games/introduction/installation/": {
                        tf: 1.0,
                      },
                    },
                    df: 1,
                  },
                },
              },
            },
            t: {
              docs: {},
              df: 0,
              r: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  d: {
                    docs: {},
                    df: 0,
                    u: {
                      docs: {},
                      df: 0,
                      c: {
                        docs: {},
                        df: 0,
                        t: {
                          docs: {
                            "https://javelin.games/introduction/": { tf: 1.0 },
                          },
                          df: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        n: {
          docs: {},
          df: 0,
          e: {
            docs: {},
            df: 0,
            t: {
              docs: {},
              df: 0,
              w: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    k: {
                      docs: {
                        "https://javelin.games/networking/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
        },
        p: {
          docs: {},
          df: 0,
          e: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              f: {
                docs: {},
                df: 0,
                o: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    m: {
                      docs: {
                        "https://javelin.games/ecs/performance/": { tf: 1.0 },
                      },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
        },
        r: {
          docs: {},
          df: 0,
          e: {
            docs: {},
            df: 0,
            s: {
              docs: {},
              df: 0,
              o: {
                docs: {},
                df: 0,
                u: {
                  docs: {},
                  df: 0,
                  r: {
                    docs: {},
                    df: 0,
                    c: {
                      docs: { "https://javelin.games/resources/": { tf: 1.0 } },
                      df: 1,
                    },
                  },
                },
              },
            },
          },
        },
        s: {
          docs: {},
          df: 0,
          y: {
            docs: {},
            df: 0,
            s: {
              docs: {},
              df: 0,
              t: {
                docs: {},
                df: 0,
                e: {
                  docs: {},
                  df: 0,
                  m: {
                    docs: { "https://javelin.games/ecs/systems/": { tf: 1.0 } },
                    df: 1,
                  },
                },
              },
            },
          },
        },
        t: {
          docs: {},
          df: 0,
          o: {
            docs: {},
            df: 0,
            p: {
              docs: {},
              df: 0,
              i: {
                docs: {},
                df: 0,
                c: {
                  docs: { "https://javelin.games/ecs/topics/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
        },
        w: {
          docs: {},
          df: 0,
          o: {
            docs: {},
            df: 0,
            r: {
              docs: {},
              df: 0,
              l: {
                docs: {},
                df: 0,
                d: {
                  docs: { "https://javelin.games/ecs/world/": { tf: 1.0 } },
                  df: 1,
                },
              },
            },
          },
        },
      },
    },
  },
  documentStore: {
    save: true,
    docs: {
      "https://javelin.games/ecs/": {
        body: "This section aims to serve as a quick primer on Entity Component Systems (ECS) and how to think in ECS. The goal is not to belittle other methods of building games or make ECS seem like a panacea, because ECS does come with its own challenges. Godot has a great article about why Godot does not use ECS that I recommend you read if you are trying to determine whether or not you should use Javelin.\n\n  \n    Tip — this section contains pseudo-code. Skip to the Hello World section if you're ready for real examples.\n  \n\nBuilding a Game#\n\nA best practice in OOP game development is to favor composition over inheritance when designing game data and behavior. Take the following example, where a Player class accepts Body and Input objects to enhance players with physics properties and input control:\nclass Body {\n  readonly velocity = { x: 0, y: 0 }\n}\n\nclass Player {\n  private body: Body\n  private input: Input\n\n  constructor(body: Body, input: Input) {\n    this.body = body\n    this.input = input\n  }\n\n  jump() {\n    this.body.velocity[1] += 1\n  }\n\n  update() {\n    if (this.input.key(\"space\")) {\n      this.jump()\n    }\n  }\n}\n\nconst player = new Player(new Body(), new Input())\n\nsetInterval(() =&gt; {\n  player.update()\n}, 16.66666)\n\nWhen the player presses the spacebar on their keyboard, player.jump() is called, and the physics body jumps! Easy enough.\nWhat if a player wants to spectate our game instead of controlling a character? In that scenario, it would be unnecessary for Player to care about Body, and we'd need to write code that makes Body an optional dependency of Player, e.g.\nclass Player {\n  private body?: Body\n  ...\n  jump() {\n    this.body?.velocity[1] += 1\n  }\n}\n\nIf there are many states/dependencies a player can have (e.g. spectating, driving a vehicle, etc.), our Player class might explode with complexity. Going even further, Player would need to define all it's possible dependencies in advance, making runtime composition difficult or even impossible.\nWhat's an ECS?#\n\nData and behavior are separate concerns in an ECS. There are three main parts to an ECS: components – game data, entities – game objects (like a tree, chest, or spawn position), and systems – game behavior. As we'll see, this architecture enables runtime composition of behavior that would be tricky to implement in the example above.\nComponents#\n\nIn an ECS, components are typically plain objects that contain data and no methods. Ideally all game state lives in components.\nplayer = { name: string }\ninput  = { jump: boolean }\nbody   = { velocity: [number, number] }\nEntities#\n\nIn most ECS implementations (including Javelin) entities are integers that reference a unique array of components. An entity typically represents a game object (like a player, vehicle, or weapon) that could be made up of many components, but sometimes may only reference a single component with the purpose of holding global state. Entities do not store any data of their own, and are fully defined by their component makeup.\nSystems#\n\nSystems are functions that iterate over entities and modify their components. Systems contain most (ideally all) game logic in an ECS. The following pseudo-code is a depiction of how we might implement the jumping behavior from the above \"traditional\" example using the ECS pattern.\nfor entity of (player, input, body)\n  if (input[entity].jump)\n    body[entity].y += 1\n\nThis example shows a system which iterates all components that have a Player, Body, and Input (e.g. a gamepad) component. Each player's input component is checked to determine if the jump key is pressed. If so, we locate the entity's body component and add to it's y-velocity.\nSpectators can now be represented with a (Player, Input) entity. Even though they aren't controlling a physics body yet, the Input component might allow them to move the game camera around. If the player chooses to enter the fray, we can insert a Body component into their entity, allowing them to control an actor in the scene.\nadd(entity, Body)\n\nThis pattern can be applied to many types of games. For example, an FPS game might consist of systems that handle physics, user input and movement, projectile collisions, and player inventory.\n",
        id: "https://javelin.games/ecs/",
        title: "ECS",
      },
      "https://javelin.games/ecs/change-detection/": {
        body: 'Javelin implements a very basic change detection algorithm using Proxy that can observe deeply nested changes made to components.\nChange detection is very useful, but difficult to do performantly; therefore, components are not observed by default to achieve good baseline performance.\nTechniques#\n\nThe world.getObserved method returns a copy of a component that will notify the world when its data changes. It\'s important to remember to use this method when you want to use one of the change detection techniques outlined below. Bugs can arise in your game when you expect a component to be observed but you forgot to manipulate an observed copy.\nObserving#\n\nIf you want to know exactly what changes were made to a component during the current tick, use world.getMutations. This method returns a flattened array of changes made to a component. Take the following example:\nfor (const [entity, position, input] of queries.vehicles) {\n  const observedPosition = world.getObserved(position)\n\n  observedPosition.x = 2\n  observedPosition.y = 3\n  observedPosition.extra.asleep = true\n\n  world.getMutations(position) // -&gt; ["x", 2, "y", 3, "extra.asleep", true]\n}\nNetworking#\n\n@javelin/net uses this change detection algorithm to optimize packet size by only including the component data that changed during the previous tick in network messages. This means that changes made to unobserved components will not be sent to clients.\n',
        id: "https://javelin.games/ecs/change-detection/",
        title: "Change Detection",
      },
      "https://javelin.games/ecs/components/": {
        body: 'Most data within a game is stored in components. Components are just plain objects; unremarkable, other than one reserved field: __type__ — short for type id, a unique integer that is shared between all components of the same kind.\nThe __type__ field establishes the taxonomy that Javelin uses to store and retrieve components. Take the following example.\nconst position = { __type__: 0, x: 2, y: 2 }\nconst health = { __type__: 0, value: 100 }\n\nUsing the same __type__ for components with a different shape could result in catastrophic behavior! Just make the types unique:\nconst position = { __type__: 0, ... }\nconst health = { __type__: 1, ... }\nComponent Types#\n\nThe createComponentType helper is used to define the types of components in your game. Component types make it easy to initialize components from a schema, and components created with a component type are automatically pooled.\nimport { createComponentType, number } from "@javelin/ecs"\n\nconst Position = createComponentType({\n  type: 1,\n  schema: {\n    x: number,\n    y: number,\n  },\n})\n\nA component type has, at minimum, a type and schema, which is discussed below.\nSchema#\n\nA component type\'s schema defines the field names and data types that make up the shape of the component. The schema is used to initialize component instances and reset them when they are detached from an entity.\nThe schema currently supports the following data types:\nnumber  (default = 0)\nboolean (default = false)\nstring  (default = "")\narray   (default = [])\n\nA default value for a data type can be specified in the schema by wrapping the data type in an object:\nschema: {\n  x: { type: number, defaultValue: -1 }\n}\nCreating Components#\n\nA component is initialized from a component type using world.component:\nconst position = world.component(Position)\n\nposition.x // 0\nposition.y // 0\n\nYou may also specify an initializer function for a component type to make component creation easier.\nconst Position = createComponentType({\n  ...\n  initialize(position, x = 0, y = 0) {\n    position.x = x\n    position.y = y\n  },\n})\n\nconst position = world.component(\n  Position,\n  10, // x\n  20, // y\n)\nObject Pooling#\n\nComponents created via a component type are automatically pooled. By default, the pool will initialize 10^3 components for use, and will grow by the same amount when the pool shinks to zero. This may not be ideal, especially for singleton or low-volume components. You can modify the default pool size of all component types by setting the componentPoolSize option on the config object passed to createWorld():\nconst world = createWorld({\n  componentPoolSize: 100,\n})\n\nOr, you can specify the pool size for a single component type when registering the it with world.registerComponentType:\nworld.registerComponentType(Position, 10000)\n\n  \n    Tip — the configured or default pool size will be used if a component type is encountered by world.component() prior to manual registration.\n  \n',
        id: "https://javelin.games/ecs/components/",
        title: "Components",
      },
      "https://javelin.games/ecs/effects/": {
        body: 'You\'ll often need to interact with some asynchronous code, third-party library, or API that wouldn\'t fit cleanly into Javelin\'s synchronous/serializable model. An effect is a container for one of these resources.\nHandling Side-Effects#\n\nThe below example demonstrates a worker effect that might perform some expensive computation in a worker thread and return a result back to the system when finished.\nconst sysPhysics = () =&gt; {\n  const { result, doExpensiveComputation } = effects.worker()\n\n  if (shouldRun &amp;&amp; !result) {\n    doExpensiveComputation()\n  }\n\n  if (result) {\n    // do something with result\n  }\n}\n\nEffects are created using the aptly named createEffect. This function accepts a callback as its first argument. The provided callback receives the active World as its first parameter, should define any state (variables) used by the effect, and return a function to be executed each tick.\nBelow is an effect that will return false until the provided duration passes:\nimport { createEffect } from "@javelin/ecs"\n\nconst useTimer = createEffect(world =&gt; {\n  // effect state\n  let state = 0\n  // effect function\n  return (duration: number) =&gt; {\n    if (state === 0) {\n      state = 1\n      setTimeout(() =&gt; (state = 2), duration)\n    }\n    return state === 2\n  }\n})\n\n  \n    Tip — effects in Javelin have some similarities to React effects. They are executed each update (tick) and  read/modify closed-over variables.\n  \n\nEffects have a single rule: they must be called in the same order order and at the same frequency every tick. This means that you shouldn\'t call effects conditionally (i.e. in a if/else statement or a loop).\nBy default, Javelin will create a copy of the effect closure for each effect call. This lets you use multiple effects of the same type without conflict. Take the example below, where both timers run alongside eachother, with the second timer finishing one second after the first.\nconst sysA = () =&gt; {\n  if (useTimer(1000)) console.log("a")\n  if (useTimer(2000)) console.log("b")\n}\n(1000ms)\n&gt; "a"\n(1000ms)\n&gt; "b"\nEffect Modes#\n\nEffects can exist in either local mode or global mode. Local effects are scoped to the system in which they were executed. Javelin instantiates one closure per local effect within a system. Global effects are executed a maximum of one time per tick. All calls to global effects refer to the same closure. Local mode is enabled by default.\nLocal Effects#\n\nLocal effects are useful if you want to perform a one-off task, like perform an API request:\nconst sysQuestUI = () =&gt; {\n  const context = effects.canvas()\n  const { done, quests } = effects.fetch("/quests?complete=false")\n\n  if (done) {\n    // render quest log\n  }\n}\n\nAlthough you should strive to have all game state in components, it can be tedious to create a singleton component each time you need some state within a system. Effects can be used to wrap arbitrary values that persist between ticks.\nconst sysFibonacci = () =&gt; {\n  const a = effects.ref(0)\n  const b = effects.ref(1)\n  const bPrev = b.value\n\n  b.value += a.value\n  a.value = bPrev\n\n  console.log(a.value)\n}\n\n  \n    Tip — using effects to store system state may bother the ECS purist, but it\'s undeniably convenient and practical, especially for simple cases where state wouldn\'t need to be serialized or shared with another system.\n  \n\nGlobal Effects#\n\nThe most common use-case for effects is probably interacting with a third party, like a physics simulation. Effects can also execute queries just like systems, letting you update the external resource when things change within the ECS. Global effects are a good candidate for encapsulating this type of dependency. They are only executed once per tick and share the same state between systems.\nBelow is an example of a global effect that instantiates a third party physics simulation, keeps simulation bodies in sync with ECS entities, and steps the simulation in sync with the Javelin world.\nconst effSim = createEffect(world =&gt; {\n  const sim = new Library.Simulation()\n  return () =&gt; {\n    queries.attached.forEach(...)  // add new bodies to simulation\n    queries.detached.forEach(...)  // remove detached bodies from simulation\n    queries.simulated.forEach(...) // copy simulation state to components\n    sim.step(world.state.currentTickData) // step simulation in sync with world\n    return sim\n  }\n}, {\n  global: true\n});\n\nconst sysJump = () =&gt; {\n  const sim = effSim()\n  queries.jumping.forEach((e, [body, input]) =&gt; {\n    sim.applyImpulse(body.simulationId, ...)\n  })\n}\n\nconst sysMove = () =&gt; {\n  // references the same simulation as in sysJump\n  const sim = effSim()\n  ...\n}\nBuilt-in Effects#\n\nSome useful effects are included with the core ECS package. A few are outlined below.\n\n  \n    Tip — check the source code of this page to see a few effects in action.\n  \n\nuseRef&lt;T&gt;(initialValue: T): { value: T }#\n\nuseRef returns a mutable value that persists between ticks.\nThe following example demonstrates a ref which stores the radius of the largest organism in a game. This value is persisted through ticks, so it ultimately references the radius of the largest organism queried across all ticks, not just the current tick.\nconst biggest = useRef&lt;number | null&gt;(null)\n\norganisms.forEach((entity, [circle]) =&gt; {\n  if (circle.radius &gt; biggest.value) {\n    biggest.value = circle.radius\n  }\n})\nuseInterval(duration: number): boolean#\n\nThe useInterval effect returns false until the specified duration passes, at which point it will begin returning true. It will then immediately flip back to false until the duration passes again.\nYou could use useInterval to write a system that sends user input to a server at regular intervals:\nconst send = useInterval(INPUT_SEND_FREQUENCY)\n...\nif (send) {\n  channel.send(input)\n}\nuseJson&lt;T&gt;(path: string | null, options: FetchDict, invalidate: boolean): RequestState&lt;T&gt;#\n\nThe useJson effect initiates an HTTP request and returns an object that describes the state of the request. Passing a null URL will cancel any ongoing requests.\nconst { done, response, error } = useJson(\n  player.value\n    ? `/players/${player.value.id}/inbox`\n    : null\n)\n\nif (done) {\n  for (const message of response) {\n    draw(...)\n  }\n}\n\n',
        id: "https://javelin.games/ecs/effects/",
        title: "Effects",
      },
      "https://javelin.games/ecs/entities/": {
        body: 'An entity is a pointer to a unique collection of components that represent higher-order objects in your game. Entities are strictly defined by their component makeup, and do not contain any data or methods of their own.\nEntity Management#\n\nA world has several methods for managing entities.\nCreating Entities#\n\nEntities are created using world.spawn. This method accepts 0..n components and returns the newly created entity.\nconst player = { __type__: 1, name: "elrond" }\nconst health = { __type__: 2, value: 100 }\nconst entity = world.create(player, health)\n\n  \n    Tip — although entities are simply auto-incrementing integers (starting at 0), they should be treated as opaque values.\n  \n\nModifying Entities#\n\nThe array of components associated with an entity defines its archetype. The above example would create an entity of archetype (Player, Health).\nComponents can be assigned to existing entities using world.attach, and removed from entities using world.detach. The following example modifies an entity of archetype (Player, Health) to (Player, Health, Input), and then back to (Player, Health):\nconst input = { __type__: 3, space: true }\n\nworld.attach(entity, input)\nworld.step() // (Player, Health) -&gt; (Player, Health, Input)\n\nworld.detach(entity, input)\nworld.step() // (Player, Health, Input) -&gt; (Player, Health)\n\n  \n    Tip — using world.attach and world.detach to build entities is slower than world.create(...components) because the components of the affected entity must be relocated each time the entity\'s archetype changes.\n  \n\nDestroying Entities#\n\nEntities are destroyed with world.destroy:\nworld.destroy(entity)\n\nWhen an entity is destroyed, its components are automatically released back to their object pool if they were derived from a component type.\nWorld Operations#\n\nIn the example above, world.step() was called each time entity was modified. Operations like creating and destroying entities, as well as attaching and detaching components, are deferred until the next world.step() call. This is done to improve the predictability of systems, so that systems never miss changes to entities, discussed in the Events section. \nEach of these changes is represented by a WorldOp object. You can review the types of operations in world_op.ts. These objects are used in the Javelin network protocol to synchronize entities reliably between client and server.\n',
        id: "https://javelin.games/ecs/entities/",
        title: "Entities",
      },
      "https://javelin.games/ecs/events/": {
        body: "You'll eventually need to detect when components are added, removed, or modified. For example, you may want to know when a component is attached to, or detached from, an entity in order to trigger a change in the ECS or notify a third-party library. You can use some of Javelin's built-in effects and methods to react to these kinds of events.\nSignals#\n\nA world dispatches several events, called signals, that can be used to react to changes in the ECS.\nThe world.attached and world.detached signals are dispatched when components are attached to and deatched from an entity, respectively:\nworld.attached.subscribe((entity, component) =&gt; {\n  // component was attached last tick\n})\nworld.detached.subscribe((entity, component) =&gt; {\n  // component was detached last tick\n})\n\nworld.spawned is dispatched when an entity is created:\nworld.spawned.subscribe(entity =&gt; {\n  // entity was created last tick\n})\n\nworld.destroyed is dispatched when an entity is destroyed:\nworld.destroyed.subscribe(entity =&gt; {\n  // entity was destroyed last tick\n})\n\nA function is returned from signal.subscribe() that can be used to remove the subscriber.\nconst unsubscribe = world.attached.subscribe(...)\nunsubscribe()\nTriggers#\n\nSubscribing to events within systems is tricky since a system is just a function that runs each tick. Javelin has a couple of built-in effects called triggers that register event handlers behind the scenes, exposing changed entitites with an iterable API.\neffAttach#\n\nThe effAttach trigger accepts a component type and returns an object that can be iterated with for..of or forEach to get entity-component pairs where the component of the specified type was detached last tick.\nimport { effAttach } from \"@javelin/ecs\"\n\nconst sysPhysics = () =&gt; {\n  effAttach(Body).forEach((entity, body) =&gt; {\n    ...\n  })\n}\neffDetach#\n\neffDetach is similar to effAttach, but it returns entity-component pairs whose matching component was detached last tick.\nimport { effDetach } from \"@javelin/ecs\"\n\nconst sysPhysics = (world: World) =&gt; {\n  effDetach(Body).forEach((entity, body) =&gt; ...)\n}\nMonitors#\n\nSometimes you need to go a bit further and detect when an entity matches or no longer matches a complex query. A monitor is an effect that accepts a query and yields entities that meet one of these conditions. Like triggers, monitors can be iterated with forEach or for..of.\nAn entity is only included in a monitor's results once while it continues to match the query. An entity is eligible again only if it is excluded (i.e. due to a change in its type) and re-included.\neffInsert#\n\nThe effInsert monitor yields entities who will match a specific query for the first time this tick.\nconst spooky = createQuery(Enemy, Ghost)\neffInsert(spooky).forEach(entity =&gt; ...)\n\nforEach executes the provided callback for entities whose component changes last tick caused it to match the query's criteria. In the above example, the entity variable would correspond to an entity who made one of the following type transitions last tick:\nfrom    | to\n--------|----------------\n()      | (Enemy, Ghost)\n(Enemy) | (Enemy, Ghost)\n(Ghost) | (Enemy, Ghost)\n\nBelow is an example of an entity transitioning between multiple types, and whether or not that transition would result in the entity being included in effInsert's results:\n(Enemy)                  -&gt; excluded\n(Enemy, Ghost)           -&gt; included\n(Enemy, Ghost, Confused) -&gt; excluded\n(Ghost, Confused)        -&gt; excluded\n(Enemy, Ghost)           -&gt; included\neffRemove#\n\neffRemove is simply the inverse of effInsert. It will yield entities whose type no longer matches the query's criteria.\neffRemove(spooky).forEach(entity =&gt; ...)\n(Enemy)                  -&gt; excluded\n(Enemy, Ghost)           -&gt; excluded\n(Enemy, Ghost, Confused) -&gt; excluded\n(Ghost, Confused)        -&gt; included\n(Enemy, Ghost)           -&gt; excluded\n",
        id: "https://javelin.games/ecs/events/",
        title: "Events",
      },
      "https://javelin.games/ecs/performance/": {
        body: "Javelin aims to provide a pleasant developer experience without sacrificing much in the way of speed. It performs around middle of the pack when compared with other ECS libraries written in JavaScript.\nIteration performance and memory usage are two major concerns of an ECS. This section expands on Javelin's approach to each.\nIteration#\n\nJavelin stores components in objects called archetypes. An archetype contains components of entities that share the exact same composition. An array of archetypes acts as an index that lets a query skip entire swathes of entities that don't match its selector. For example, when querying for entities with components (A, B), we can skip iteration of entities within all archetypes that aren't superset of (A, B).\nIn a simple benchmark of 10 component types, 10 archetypes, and 10 queries, Javelin achieves (at 60Hz):\n\n~2.3m iterations per tick on a 2GHz Intel i5 processor (2020 Macbook Pro 13-inch)\n~4m iterations per tick on a 3.79 GHz AMD processor (Ryzen 3900XT)\n\nYou can see how archtypes and queries are implemented in archetype.ts and query.ts, respectively.\nResources#\n\n\nSpecs and Legion, two very different approaches to ECS  by Cora Sherratt\nBuilding an ECS #2: Archetypes and Vectorization\n by Sander Mertens\nMemory in Javascript— Beyond Leaks by Yonatan Kra\n\nMemory#\n\nStorage#\n\nIn C/C++ ECS implementations, components are typically represented as byte arrays. This lets the CPU optimize loops that iterate components because data is stored sequentially in packed arrays. We have less control over how memory is allocated in a high-level language like JavaScript, although there are examples of TypedArray-based ECS libraries that can achieve very good performance.\nIn Javelin, components are plain old JavaScript objects. Using regular objects makes Javelin easier to understand for people unfamiliar with vectorization or binary data. It also makes it easier to support complex nested component structures, and makes it trivial to get data in/out of the ECS (e.g. for serialization).\nGarbage Collection#\n\nBelow is a screenshot of an allocation timeline where 10k entities are iterated by 3 systems per tick at 60Hz. The memory growth (0.3mb) is consistent with standard setInterval or requestAnimationFrame performance and there is no \"sawtooth\" pattern of frequent, minor GC events.\nSimple requestAnimationFrame loop\n\nSimple requestAnimationFrame loop @ 10k entities/tick\n\nPerformance Tests#\n\nRun the performance tests by cloning the repository and running yarn perf:\ngit clone https://github.com/3mcd/javelin\ncd javelin\nyarn &amp;&amp; yarn perf\n\nExample yarn perf output:\n========================================\nperf_storage\n========================================\ncreate: 424.487ms\nrun: 16.624s\ndestroy: 103.358ms\nentities      | 855000\ncomponents    | 4\nqueries       | 4\nticks         | 1000\niter          | 997500000\niter_tick     | 997500\navg_tick      | 17.015ms\n",
        id: "https://javelin.games/ecs/performance/",
        title: "Performance",
      },
      "https://javelin.games/ecs/systems/": {
        body: "A system is simply a function executed during each world tick. All game logic should live within systems.\nGame Logic#\n\nEach system should implement some subset of your game's logic. Ideally a system manages a small number of concerns. There is minimal performance overhead to having multiple small systems versus monolithic ones, and smaller systems are easier to read, test, and maintain.\nBelow is an example set of systems that could be found in a top-down ARPG.\nSystemDescription\nsysAiEnemyEnemy AI logic\nsysAiCompanionCompanion AI logic\nsysInputSample mouse/keyboard input\nsysCombatTransform controller input to combat actions\nsysMovementTransform controller input to movement actions\nsysPhysicsApply forces and step physics simulation\nsysPickupsDetect collisions with items and update player inventory\nsysRenderRender game\nsysRenderUIRender user interface\n...\n\nRegistering a System#\n\nA system is a void function that accepts a World instance as its only parameter:\nconst sysAiEnemy = (world: World) =&gt; {}\n\nSystems are registered with the world via the options passed to createWorld, or the world.addSystem method.\nconst sysPhysics = () =&gt; ...\nconst sysRender = () =&gt; ...\nconst world = createWorld({ systems: [sysPhysics] })\n\nworld.addSystem(sysRender)\n\nWhen world.step() is called, each system is executed in the order that it was registered.\nSystems have a signature of (world: World&lt;T&gt;) =&gt; void, where the first argument is the world that is currently mid-tick. A single value can be passed to world.step(data), which is then available in each system via world.state.currentTickData. Often times this value holds the amount of time that has elapsed since the previous tick, but it can be any value.\nThe following is a world that will log the time elapsed since the last tick at around 60Hz:\nconst world = createWorld&lt;number&gt;({\n  systems: [world =&gt; console.log(world.state.currentTickData)],\n})\n\nlet previousTime = Date.now()\n\nsetInterval(() =&gt; {\n  const currentTime = Date.now()\n  const delta = currentTime - previousTime\n\n  world.step(delta)\n\n  previousTime = currentTime\n}, 1000 / 60)\n&gt; 16.66666666\n&gt; 16.66666666\n&gt; 16.66666666\n\n  \n    Tip — maintaining state using tick data is comparable to using global variables. Consider moving this state into a singleton component. Or, if you need inter-system communication, you can pass messages using topics, which are discussed in the Topics section.\n  \n\nQuerying and Iteration#\n\nSystems query collections of entities and operate on their data to yield the next game state. These iterable collections are created using queries that specify a set of component types to query.\nDepending on its archetype, an entity may be eligible for iteration by a system one tick, and ineligible the next. This is the cornerstone of ECS: modifying component makeup also modifies game behavior. In addition, the isolation of game logic into systems makes your game world easier to debug and provides a clear target for performance and unit tests.\nQueries are created with the query function, which takes a selector of component types.\nimport { query } from \"@javelin/ecs\"\n\nconst players = createQuery(Position, Velocity)\n\nA query is an iterable object that produces tuples of (entity, Component[]) for entities that meet the selector's criteria.\nThere are two ways to iterate a query. The first (and fastest) way is to iterate the query directly with a for..of loop:\nfor (const [entities, [position, velocity]] of players) {\n  for (let i = 0; i &lt; entities.length; i++) {\n    position[i].x += velocity[i].x\n    position[i].y += velocity[i].y\n  }\n}\n\nThis method of iteration leaks the implementation details of how components are stored in archetypes. An outer for..of loop iterates through each matching archetype, while an inner loop accesses components for each matching entity. If your game doesn't reach high entity counts (10^5) and you don't mind a 2-3x iteration performance hit, consider using forEach. This method executes a callback for each entity that matches the query:\nplayers.forEach((entity, [position, velocity]) =&gt; {\n  position.x += velocity.x\n  position.y += velocity.y\n})\n\n  \n    Tip — most examples in the Javelin docs use forEach since it's a bit easier to read, but stick to the for..of approach if your game has many entities.\n  \n\nThe order of component types in the query's selector will match the order of components in the query's results. That is, createQuery(Position, Player) will always yield tuples of components (Position, Player):\nworld.create(world.component(Player), world.component(Position))\nworld.create(world.component(Position), world.component(Player))\n\nconst sysRender = () =&gt; {\n  players.forEach((entity, [position, player]) =&gt; {\n    // render each player with a name tag\n    draw(sprites.player, position, player.name)\n  })\n}\nQuery Caveats#\n\nThe tuple of components yielded by queries is re-used each iteration. This means that you shouldn't store the results of a query for use later like this:\nconst sysStatusEffects = () =&gt; {\n  const results = []\n  shocked.forEach((e, components) =&gt; {\n    results.push(components)\n  })\n  ...\n}\n\nEvery index of results corresponds to the same array, which is the tuple of components attached to the entity of the last iteration. If you absolutely need to store components between queries (e.g. you are optimizing a nested query), you could push the components of interest into a temporary array, e.g.\nconst results = []\nshocked.forEach((e, [a, b]) =&gt; {\n  results.push([a, b])\n})\n",
        id: "https://javelin.games/ecs/systems/",
        title: "Systems",
      },
      "https://javelin.games/ecs/topics/": {
        body: 'Systems are typically pure, as they only read/modify the components of queried entities. However, as your game grows, you may want a system to trigger behavior in a different system. For example, you may write a physics system that wraps a third-party library whose methods you\'d like to expose to other physics-interested systems.\nTopics facilitate a way to do this without resorting to global state, unlike global effects.\nInter-System Communication#\n\nLet\'s say you want to apply an impulse to a physics body when a player jumps so it gains some momentum in a direction. One way of doing this is to model the operation as a component.\ntype Impulse = {\n  x: number\n  y: number\n}\n\nWhen you need to apply a impulse to an entity, you insert an Impulse component on the current tick, and remove it on the following tick.\nconst sysInput = () =&gt; {\n  queries.jumping.forEach(entity =&gt; {\n    world.attach(entity, world.component(Impulse))\n  })\n  queries.withImpulse.forEach(entity =&gt; {\n    world.detach(entity, impulse)\n  })\n}\n\nconst sysPhysics = () =&gt; {\n  queries.withImpulse((entity, [impulse]) =&gt; {\n    const body = getBodyByEntity(entity)\n    physicsEngine.applyImpulseLocal(body, impulse)\n  })\n}\n\nThis will work fine for a small game; however, there are a couple of problems with this approach as you scale to more complex games:\n\nAdding and removing components in an archetypal ECS is slow\nYour physics system must wait until the next tick to detect the newly attached impluse component\n\nTopics#\n\nTopics are simple FIFO buffers that hold on to messages between ticks that can be used to signal events or expose an RPC-like API to a system.\nTopics are created using the createTopic&lt;T&gt;() function, where T is the type (e.g. a union type) of message managed by the topic. The createTopic function is defined in topic.ts.\nimport { createTopic } from "@javelin/ecs"\n\ntype ImpulseCommand = [type: "impulse", entity: number, force: [number, number]]\n\nconst physicsTopic = createTopic&lt;ImpulseCommand&gt;()\n\nMessages are enqueued using the topic.push() method.\nconst message: ImpulseCommand = ["impulse", 23, [0, 2]]\nphysicsTopic.push(message)\n\nMessages are unavailable until the topic.flush() method is called. You can call flush() manually, or you can configure your world to do it automatically with the topics option:\ncreateWorld({\n  topics: [physicsTopic],\n  ...\n})\n\nMessages can then be read using a for..of loop.\nimport { physicsTopic } from "./physics_topic"\n\nconst sysPhysics = () =&gt; {\n  for (const command of physicsTopic) {\n    if (command[0] === "impulse") {\n      const body = getBodyByEntity(command[1])\n      physicsEngine.applyImpulseLocal(body, command[2])\n    }\n  }\n}\nImmediate Processing#\n\nSometimes messages should be handled as quickly as possible, like when processing user input. topic.pushImmediate will push a message into the topic for immediate processing.\n\n  \n    Tip — System registration order matters when using pushImmediate. Since the messages will be thrown away at the end of the tick, any systems upstream from the one that used pushImmediate will never have the opportunity to read the message.\n  \n\nphysicsTopic.pushImmediate(["impulse", 24, [0, 2]])\n',
        id: "https://javelin.games/ecs/topics/",
        title: "Topics",
      },
      "https://javelin.games/ecs/world/": {
        body: '\n  \n    Tip — the following chapters assume that you are familiar with basic ECS concepts discussed in the opening section.\n  \n\nWorlds are responsible for maintaining entities and executing systems. They expose a methodto step the world forward in time, methods for managing entities and their components, and events that trigger when the state of the ECS changes.\nA world is created using the createWorld function defined in world.ts. createWorld accepts a config object that, at minimum, defines an array of systems that the world should execute each tick.\nimport { createWorld } from "@javelin/ecs"\n\nconst world = createWorld({\n  systems: [() =&gt; console.log("Tick!")],\n})\n\nSystems can also be registered after a world is initialized using the world.addSystem method:\nworld.addSystem(() =&gt; console.log("Tock!"))\n\nCalling world.step() will process operations (like adding, removing, updating entities) that occurred during the previous tick. Then, all systems will be executed in the order that they were registered.\nsetInterval(world.step, 1000)\n\nMore on systems later in the Systems section!\nFinding Components#\n\nComponents are generally accessed using iterable queries. However, queries only locate entities who meet each of the selector\'s criteria. This makes it difficult to write conditional logic based on the presence of a component. For example, you may want to apply damage to all entities that match (Health, Burn), but only if the entity doesn\'t have an Invulnerable component.\nworld.tryGet attempts to locate a component of an entity by component type, returning null if not found:\nif (world.tryGet(entity, Invulnerable) === null) {\n  health.value -= burn.valuePerTick\n}\n\nworld.get will throw an error if the component is not found, which can be used to assert a relationship between an archetype and another component type.\n// an entity of (Health, Burn) should always have a position\nworld.get(entity, Position)\nCleanup#\n\nSnapshots#\n\nYou can take a snapshot of a world using world.snapshot() and create a new world from it later:\nconst world = createWorld({ snapshot: JSON.parse(localStorage.getItem("world")) })\n...\nconst snapshot = world.snapshot()\nlocalStorage.setItem("world", JSON.stringify(world.snapshot))\nReset#\n\nUse world.reset() to completely reset a world. This method will clear all entity and component data, releasing pooled components along the way.\n',
        id: "https://javelin.games/ecs/world/",
        title: "World",
      },
      "https://javelin.games/introduction/": {
        body: "\nJavelin is a collection of packages used to build multiplayer games. The core package is an Entity-Component System (ECS).\nCheck out the code at the GitHub repo or, move onto the ECS chapter to start learning how to use Javelin!\n\n\n",
        id: "https://javelin.games/introduction/",
        title: "Introduction",
      },
      "https://javelin.games/introduction/installation/": {
        body: 'npm#\n\nJavelin ECS can be installed via npm:\nnpm i @javelin/ecs\n\nThe following three builds are published to NPM:\nUMD#\n\nPath: dist/javelin-ecs.bundle.min.js\nYou can include the minified UMD bundle in your HTML via &lt;script&gt; tag. All module exports are available via window.Javelin:\n\n&lt;script src="node_modules/@javelin/ecs/dist/javelin-ecs.bundle.min.js"&gt;&lt;/script&gt;\n&lt;script&gt;\n  const world = Javelin.createWorld()\n&lt;/script&gt;\nES Modules#\n\nPath: dist/esm/index.js\nThe package.json module field points to the ESM build, which will be automatically discovered by tools like Webpack and Rollup. You can of course also import the ES module directly in browsers that support ECMAScript modules.\n\n&lt;script type="module" src="node_modules/@javelin/ecs/dist/esm/index.js"&gt;&lt;/script&gt;\nCommonJS#\n\n\n  Tip — this build does not support tree shaking.\n\nPath: dist/cjs/index.js\nThe package.json main field points to the CommonJS build, which will be included automatically when loaded with Node\'s require():\nconst Javelin = require("@javelin/ecs")\n',
        id: "https://javelin.games/introduction/installation/",
        title: "Installation",
      },
      "https://javelin.games/networking/": {
        body: "",
        id: "https://javelin.games/networking/",
        title: "Networking",
      },
      "https://javelin.games/resources/": {
        body: "Examples#\n\n\nNetworking Example\nJavelin FPS\n\nGuides#\n\n",
        id: "https://javelin.games/resources/",
        title: "Resources",
      },
    },
    docInfo: {
      "https://javelin.games/ecs/": { body: 399, title: 1 },
      "https://javelin.games/ecs/change-detection/": { body: 131, title: 2 },
      "https://javelin.games/ecs/components/": { body: 277, title: 1 },
      "https://javelin.games/ecs/effects/": { body: 575, title: 1 },
      "https://javelin.games/ecs/entities/": { body: 218, title: 1 },
      "https://javelin.games/ecs/events/": { body: 343, title: 1 },
      "https://javelin.games/ecs/performance/": { body: 291, title: 1 },
      "https://javelin.games/ecs/systems/": { body: 497, title: 1 },
      "https://javelin.games/ecs/topics/": { body: 268, title: 1 },
      "https://javelin.games/ecs/world/": { body: 200, title: 1 },
      "https://javelin.games/introduction/": { body: 26, title: 1 },
      "https://javelin.games/introduction/installation/": {
        body: 87,
        title: 1,
      },
      "https://javelin.games/networking/": { body: 0, title: 1 },
      "https://javelin.games/resources/": { body: 6, title: 1 },
    },
    length: 14,
  },
  lang: "English",
}
