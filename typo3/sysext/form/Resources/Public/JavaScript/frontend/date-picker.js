/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
"undefined"!=typeof $&&$((function(e){e("input[data-t3-form-datepicker]").each((function(){e(this).datepicker({dateFormat:e(this).data("format")}).on("keydown",(function(t){8!==t.keyCode&&46!==t.keyCode||(t.preventDefault(),e(this).datepicker("setDate",""))}))}))}));