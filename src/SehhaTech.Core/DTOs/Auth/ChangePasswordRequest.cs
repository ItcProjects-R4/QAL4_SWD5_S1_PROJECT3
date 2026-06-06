using System;
using System.Collections.Generic;
using System.Text;

namespace SehhaTech.Core.DTOs.Auth
{
    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}