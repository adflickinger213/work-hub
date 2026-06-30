// api/eod-chain.js
// EOD chain orchestration endpoint. Receives todayData and runs:
// 1. Sage rebalance (remaining weekdays)
// 2. Ivy synthesis (scroll proposals)
// 3. EOD snapshot write (Sprint B stub)

import { runEODChain } from "../lib/agentOrchestrator.js";
import { requireSession } from "../lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
              return;
                }

                  // Verify session
                    if (!requireSession(req, res)) return;

                      try {
                          const { todayData } = req.body;
                              if (!todayData) {
                                    res.writeHead(400, { "Content-Type": "application/json" });
                                          res.end(JSON.stringify({ ok: false, error: "missing_todaydata" }));
                                                return;
                                                    }

                                                        // Run the full EOD chain (Sage → Ivy → snapshot)
                                                            const chainResult = await runEODChain(todayData);

                                                                res.writeHead(200, { "Content-Type": "application/json" });
                                                                    res.end(JSON.stringify({ ok: true, data: chainResult }));
                                                                      } catch (err) {
                                                                          res.writeHead(500, { "Content-Type": "application/json" });
                                                                              res.end(JSON.stringify({ ok: false, error: "chain_exception" }));
                                                                                }
                                                                                }
